import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { ConnectionScreen } from './components/auth/ConnectionScreen'
import { useLeads } from './hooks/useLeads'
import { useRealtime } from './hooks/useRealtime'
import { hasValidConfig, updateSupabaseConfig } from './lib/supabase'

// Pages
import Overview from './pages/Overview'
import Leads from './pages/Leads'
import Conversations from './pages/Conversations'
import Bookings from './pages/Bookings'
import AlbertStatus from './pages/AlbertStatus'

const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(hasValidConfig())

  // Conditionally call hooks only when connected to avoid crashes
  const { leads, isLoading, refetch } = useLeads()
  const { isConnected, lastUpdated } = useRealtime(refetch)
  const location = useLocation()

  if (!isConnectedToSupabase) {
    return (
      <ConnectionScreen
        onConnect={(url, key) => {
          updateSupabaseConfig(url, key)
          setIsConnectedToSupabase(true)
        }}
      />
    )
  }

  const getTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Overview'
    if (path === '/leads') return 'Leads'
    if (path === '/conversations') return 'Conversations'
    if (path === '/bookings') return 'Bookings'
    if (path === '/albert') return 'Albert Status'
    return 'Dashboard'
  }

  const handleLogout = () => {
    localStorage.removeItem('after5_supabase_url')
    localStorage.removeItem('after5_supabase_key')
    window.location.reload()
  }

  return (
    <div className="h-screen flex overflow-hidden bg-bg-base font-sans selection:bg-accent/30 selection:text-white">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          title={getTitle()}
          isConnected={isConnected}
          lastUpdated={lastUpdated}
          leadsCount={leads.length}
          onToggleMenu={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-full xl:max-w-[90%] 2xl:max-w-[80%] mx-auto transition-all duration-500">
            <Routes>
              <Route path="/" element={<Overview leads={leads} isLoading={isLoading} />} />
              <Route path="/leads" element={<Leads leads={leads} isLoading={isLoading} refetch={refetch} />} />
              <Route path="/conversations" element={<Conversations leads={leads} isLoading={isLoading} refetch={refetch} />} />
              <Route path="/bookings" element={<Bookings leads={leads} isLoading={isLoading} />} />
              <Route path="/albert" element={<AlbertStatus />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

import React from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    CalendarCheck,
    Activity,
    Brain,
    LogOut
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
    label: string
    icon: LucideIcon
    path: string
}

interface SidebarProps {
    onLogout: () => void
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

const navItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, path: '/' },
    { label: 'Leads', icon: Users, path: '/leads' },
    { label: 'Conversations', icon: MessageSquare, path: '/conversations' },
    { label: 'Bookings', icon: CalendarCheck, path: '/bookings' },
    { label: 'Training', icon: Brain, path: '/training' },
    { label: 'Albert Status', icon: Activity, path: '/albert' },
]

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, setIsOpen }) => {
    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-bg-base/80 backdrop-blur-sm z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsOpen(false)}
            ></div>

            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-bg-sidebar border-r border-border flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <img src="/favicon.png" alt="After5 Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm leading-none text-white">After5</h2>
                            <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">Demo Dashboard</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 1024) setIsOpen(false) }}
                                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium border
                  ${isActive
                                        ? 'bg-accent/10 text-accent border-accent/20'
                                        : 'text-muted hover:text-white hover:bg-white/5 border-transparent'}
                `}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-border">
                    <div className="flex items-center gap-3 p-3 bg-bg-card/50 rounded-2xl border border-border group">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center text-accent font-bold text-sm border border-accent/20 shadow-[0_0_10px_rgba(46,255,161,0.1)]">
                            LF
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold leading-none truncate text-white">Louis F.</p>
                            <p className="text-[9px] text-muted font-mono mt-1 uppercase tracking-tighter">Admin Access</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-muted hover:text-red-400 p-1.5 transition-colors rounded-lg hover:bg-red-400/10"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

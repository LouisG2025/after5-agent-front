import React, { useState } from 'react'
import type { Lead, ConversationState } from '../../types'
import { Badge } from '../ui/Badge'
import { SignalScore } from '../ui/SignalScore'
import { SegmentedControl } from '../ui/SegmentedControl'
import { ConversationView } from './ConversationView'
import { IntelligenceView } from './IntelligenceView'
import { supabase } from '../../lib/supabase'
import { useMessages } from '../../hooks/useMessages'
import { Phone, Mail, ExternalLink, Calendar as CalendarIcon, MessageSquare, BrainCircuit, User, X, RotateCcw } from 'lucide-react'

interface LeadDetailProps {
    lead: Lead
    onClose: () => void
    refetch: () => void
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onClose, refetch }) => {
    const [activeTab, setActiveTab] = useState('conversation')
    const { messages } = useMessages(lead.id)
    const [state, setState] = useState<ConversationState | null>(null)
    const [isResetting, setIsResetting] = useState(false)

    // Load conversation state
    React.useEffect(() => {
        const fetchState = async () => {
            const { data } = await supabase
                .from('conversation_state')
                .select('*')
                .eq('lead_id', lead.id)
                .single()
            if (data) setState(data)
        }
        fetchState()
    }, [lead.id])

    const handleUpdate = () => {
        refetch()
    }

    const handleResetSession = async () => {
        if (!confirm("Are you sure you want to reset this lead's interaction history from AI memory?")) return

        setIsResetting(true)
        try {
            // Determine API URL based on environment
            const isProd = import.meta.env.PROD || window.location.hostname !== 'localhost'
            const defaultApiUrl = isProd ? 'https://after5-agent-production.up.railway.app' : 'http://localhost:8000'
            const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl
            
            const res = await fetch(`${apiUrl}/admin/reset-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: lead.phone })
            })
            const data = await res.json()
            if (data.status === 'ok') {
                alert('Session reset successfully! Albert will treat them as a new customer.')
                refetch()
            } else {
                alert(`Failed to reset session: ${data.reason || data.message}`)
            }
        } catch (error) {
            console.error('Reset failed:', error)
            alert('Failed to reset session. Ensure the backend API is reachable.')
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-bg-card relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-bg-card/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-accent border border-accent/20">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">{lead.first_name} {lead.last_name || ''}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="source" value={lead.lead_source} label="Source" />
                            <SignalScore score={lead.signal_score} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleResetSession}
                        disabled={isResetting}
                        className="px-3 py-1.5 flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                        title="Reset Lead's Session History"
                    >
                        <RotateCcw size={14} className={isResetting ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">{isResetting ? 'Resetting...' : 'Reset Session'}</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-muted hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Quick Actions / Contact */}
            <div className="p-6 border-b border-border bg-bg-sidebar/20 grid grid-cols-2 gap-4">
                <a href={`tel:${lead.phone}`} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-border hover:border-accent/40 transition-all group">
                    <div className="p-2 rounded-lg bg-bg-elevated text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                        <Phone size={16} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[9px] font-mono text-muted uppercase tracking-widest">Phone</p>
                        <p className="text-xs font-medium truncate">{lead.phone}</p>
                    </div>
                    <ExternalLink size={12} className="ml-auto text-muted/30" />
                </a>
                <a href={`mailto:${lead.email}`} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-border hover:border-accent/40 transition-all group">
                    <div className="p-2 rounded-lg bg-bg-elevated text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                        <Mail size={16} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[9px] font-mono text-muted uppercase tracking-widest">Email</p>
                        <p className="text-xs font-medium truncate">{lead.email || 'N/A'}</p>
                    </div>
                    <ExternalLink size={12} className="ml-auto text-muted/30" />
                </a>
            </div>

            {/* Tabs Navigation */}
            <div className="px-6 py-4">
                <SegmentedControl
                    options={[
                        { id: 'conversation', label: 'Conversation', icon: MessageSquare },
                        { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
                        { id: 'profile', label: 'Detailed Profile', icon: User }
                    ]}
                    activeId={activeTab}
                    onChange={setActiveTab}
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
                {activeTab === 'conversation' && (
                    <ConversationView
                        lead={lead}
                        messages={messages}
                        state={state}
                    />
                )}
                {activeTab === 'intelligence' && (
                    <IntelligenceView
                        lead={lead}
                        state={state}
                        onUpdate={handleUpdate}
                    />
                )}
                {activeTab === 'profile' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <section className="space-y-4">
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Core Meta</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-border">
                                    <p className="text-[10px] text-muted font-mono uppercase tracking-tighter mb-1">Lead ID</p>
                                    <p className="text-xs font-mono">{lead.id.substring(0, 12)}...</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-border">
                                    <p className="text-[10px] text-muted font-mono uppercase tracking-tighter mb-1">Created At</p>
                                    <p className="text-xs">{new Date(lead.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Scheduling</h3>
                            <div className="bg-accent/5 p-6 rounded-3xl border border-accent/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-accent/20 rounded-2xl text-accent">
                                        <CalendarIcon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">No confirmed booking</p>
                                        <p className="text-[10px] text-muted uppercase tracking-widest mt-0.5">Albert is nurturing towards conversion</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-accent text-bg-base text-[10px] font-bold uppercase rounded-xl hover:opacity-90 transition-opacity">
                                    Manual Book
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    )
}

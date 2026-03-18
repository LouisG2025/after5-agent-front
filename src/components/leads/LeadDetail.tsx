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
        if (!lead.id) return

        const fetchState = async () => {
            const { data } = await supabase
                .from('conversation_state')
                .select('*')
                .eq('lead_id', lead.id)
                .single()
            if (data) setState(data)
        }

        fetchState()

        // Subscribe to real-time changes for this lead's state
        const channel = supabase
            .channel(`state-${lead.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversation_state',
                    filter: `lead_id=eq.${lead.id}`
                },
                (payload) => {
                    setState(payload.new as ConversationState)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
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
        <div className="flex flex-col h-full bg-[#090b14]/40 relative custom-scrollbar overflow-y-auto overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-10 border-b border-white/5 bg-[#090b14]/60 backdrop-blur-2xl sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-accent/10 flex items-center justify-center text-accent border border-accent/20 shadow-[0_0_30px_rgba(46,255,161,0.1)]">
                        <User size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-white italic uppercase">{lead.first_name} {lead.last_name || ''}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="scale-110 origin-left">
                                <Badge variant="source" value={lead.lead_source} label="Source" />
                            </div>
                            <SignalScore score={lead.signal_score} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleResetSession}
                        disabled={isResetting}
                        className="btn-secondary !py-2.5 !px-5 !bg-red-500/5 !border-red-500/20 !text-red-500 hover:!bg-red-500/10 hover:!border-red-500/40 group relative overflow-hidden"
                        title="Reset Lead's Session History"
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <RotateCcw size={16} className={`${isResetting ? "animate-spin" : "group-hover:-rotate-180 transition-transform duration-500"}`} />
                            <span className="hidden sm:inline font-black">{isResetting ? 'PURGING...' : 'PURGE SESSION'}</span>
                        </div>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all duration-300 text-muted/40 hover:text-white border border-transparent hover:border-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Quick Actions / Contact */}
            <div className="p-10 border-b border-white/5 bg-white/[0.01] grid grid-cols-2 gap-6">
                <a href={`tel:${lead.phone}`} className="flex items-center gap-5 p-5 rounded-[28px] bg-white/[0.02] border border-white/5 hover:border-accent/40 hover:bg-white/[0.04] transition-all duration-500 group shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 text-muted/40 group-hover:text-accent group-hover:bg-accent/10 border border-white/5 group-hover:border-accent/20 flex items-center justify-center transition-all duration-500">
                        <Phone size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] mb-1 italic">Voice Line</p>
                        <p className="text-[13px] font-black text-white tracking-tight">{lead.phone}</p>
                    </div>
                    <ExternalLink size={14} className="ml-auto text-muted/10 group-hover:text-accent/40 transition-colors" />
                </a>
                <a href={`mailto:${lead.email}`} className="flex items-center gap-5 p-5 rounded-[28px] bg-white/[0.02] border border-white/5 hover:border-accent/40 hover:bg-white/[0.04] transition-all duration-500 group shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 text-muted/40 group-hover:text-accent group-hover:bg-accent/10 border border-white/5 group-hover:border-accent/20 flex items-center justify-center transition-all duration-500">
                        <Mail size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] mb-1 italic">Neural Proxy</p>
                        <p className="text-[13px] font-black text-white tracking-tight truncate max-w-[150px]">{lead.email || 'NOT_FOUND'}</p>
                    </div>
                    <ExternalLink size={14} className="ml-auto text-muted/10 group-hover:text-accent/40 transition-colors" />
                </a>
            </div>

            {/* Tabs Navigation */}
            <div className="px-10 py-8">
                <div className="glass-card !p-1.5 !rounded-2xl border-white/5 bg-white/[0.01]">
                    <SegmentedControl
                        options={[
                            { id: 'conversation', label: 'Telemetry Stream', icon: MessageSquare },
                            { id: 'intelligence', label: 'Signal Analysis', icon: BrainCircuit },
                            { id: 'profile', label: 'Object Metadata', icon: User }
                        ]}
                        activeId={activeTab}
                        onChange={setActiveTab}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden px-10 pb-10">
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
                    <div className="space-y-12 animate-fade-up">
                        <section className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted/40 italic flex items-center gap-3">
                                <div className="w-1 h-3 bg-accent/20 rounded-full" /> Core Object Metadata
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="glass-card !p-6 !rounded-[24px] !border-white/5 bg-white/[0.01] shadow-inner relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl group-hover:bg-white/10 transition-all rounded-full"></div>
                                    <p className="text-[10px] text-muted/40 font-black uppercase tracking-widest mb-2 italic">Registry ID</p>
                                    <p className="text-xs font-black font-mono tracking-tighter text-white">{lead.id}</p>
                                </div>
                                <div className="glass-card !p-6 !rounded-[24px] !border-white/5 bg-white/[0.01] shadow-inner relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl group-hover:bg-white/10 transition-all rounded-full"></div>
                                    <p className="text-[10px] text-muted/40 font-black uppercase tracking-widest mb-2 italic">Ingestion Timestamp</p>
                                    <p className="text-xs font-black text-white tracking-tight italic">{new Date(lead.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted/40 italic flex items-center gap-3">
                                <div className="w-1 h-3 bg-purple-500/20 rounded-full" /> Temporal Scheduling
                            </h3>
                            <div className="glass-card !p-8 !rounded-[32px] !border-white/5 bg-accent/5 flex items-center justify-between shadow-[0_12px_24px_-8px_rgba(46,255,161,0.05)] border-l-4 !border-l-accent">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-accent/10 rounded-[20px] flex items-center justify-center text-accent shadow-inner border border-accent/20">
                                        <CalendarIcon size={28} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-white tracking-tight italic uppercase">Awaiting Synchrony</p>
                                        <p className="text-[10px] text-muted/60 font-black uppercase tracking-[0.2em] mt-1.5 italic">Albert is optimizing for high-yield conversion window</p>
                                    </div>
                                </div>
                                <button className="btn-premium !py-3 !px-6 text-[10px]">
                                    Force Synchrony
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    )
}

import React, { useMemo, useState, useEffect } from 'react'
import type { Lead, LLMSession } from '../types'
import { StatCard } from '../components/ui/StatCard'
import { LeadCard } from '../components/leads/LeadCard'
import { supabase } from '../lib/supabase'
import {
    Users,
    MessageSquare,
    CalendarCheck,
    TrendingUp,
    LayoutDashboard,
    DollarSign,
    Zap
} from 'lucide-react'

import { SkeletonCard } from '../components/ui/SkeletonCard'
import { LeadDetail } from '../components/leads/LeadDetail'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface OverviewProps {
    leads: Lead[]
    isLoading?: boolean
}

const Overview: React.FC<OverviewProps> = ({ leads, isLoading }) => {
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
    const [sessions, setSessions] = useState<LLMSession[]>([])
    const [showLeft, setShowLeft] = useState(true)

    useEffect(() => {
        const fetchSessions = async () => {
            const { data } = await supabase.from('llm_sessions').select('*')
            if (data) setSessions(data)
        }
        fetchSessions()
    }, [])

    const stats = useMemo(() => {
        const total = leads.length
        const active = leads.filter(l => l.outcome === 'In Progress').length
        const booked = leads.filter(l => l.outcome === 'Meeting Booked').length
        const rate = total > 0 ? ((booked / total) * 100).toFixed(1) : '0.0'

        const totalCost = sessions.reduce((sum, s) => sum + (s.cost_usd || 0), 0)
        const avgLatency = sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + (s.latency_ms || 0), 0) / sessions.length)
            : 0

        return [
            { label: 'Total Leads', value: total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Active Now', value: active, icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-400/10', pulse: active > 0 },
            { label: 'Meetings Booked', value: booked, icon: CalendarCheck, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Conversion Rate', value: `${rate}%`, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-400/10' },
            { label: 'Total AI Cost', value: `$${totalCost.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Avg AI Latency', value: `${avgLatency}ms`, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ]
    }, [leads, sessions])

    return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : stats.map((s, i) => (
                        <StatCard
                            key={i}
                            label={s.label}
                            value={s.value}
                            icon={s.icon}
                            accentColor={s.color}
                            pulse={s.pulse}
                        />
                    ))
                }
            </div>

            <div className="h-px bg-border/40 w-full" />

            <div className="flex gap-6 items-start h-[700px]">
                {/* LEFT SIDEBAR: LEADS */}
                <div
                    className={`transition-all duration-500 ease-in-out border-r border-border pr-2 space-y-6 h-full flex flex-col ${showLeft ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
                        }`}
                >
                    <div className="flex items-center justify-between pr-4 sticky top-0 bg-bg-base z-10 pb-2">
                        <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                            <Users size={14} /> Recent Leads
                        </h2>
                        <button
                            onClick={() => setShowLeft(false)}
                            className="p-1 hover:bg-white/5 rounded-md text-muted hover:text-white transition-colors"
                        >
                            <PanelLeftClose size={16} />
                        </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-4">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} height="h-20" />)
                            : leads.slice(0, 15).map(lead => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    active={selectedLeadId === lead.id}
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    variant="compact"
                                />
                            ))
                        }
                        {leads.length === 0 && (
                            <div className="p-12 bg-white/5 rounded-2xl border border-border border-dashed flex flex-col items-center opacity-30">
                                <Users size={32} />
                                <p className="mt-4 text-xs font-medium">No leads yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {!showLeft && (
                    <button
                        onClick={() => setShowLeft(true)}
                        className="p-2 bg-bg-card border border-border rounded-xl text-accent hover:bg-accent/5 transition-all shadow-lg animate-in fade-in zoom-in"
                        title="Show Leads"
                    >
                        <PanelLeftOpen size={20} />
                    </button>
                )}

                {/* CENTER: WORKSPACE */}
                <div className="flex-1 h-full bg-bg-card rounded-3xl border border-border overflow-hidden flex flex-col shadow-2xl relative">
                    {selectedLeadId && leads.find(l => l.id === selectedLeadId) ? (
                        <LeadDetail
                            lead={leads.find(l => l.id === selectedLeadId)!}
                            onClose={() => setSelectedLeadId(null)}
                            refetch={() => { }}
                        />
                    ) : (
                        <div className="m-auto flex flex-col items-center text-center p-8">
                            <div className="w-24 h-24 bg-bg-base rounded-full flex items-center justify-center border border-border border-dashed mb-8 opacity-20 relative">
                                <LayoutDashboard className="text-accent" size={40} />
                                <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Lead Intelligence Hub</h3>
                            <p className="text-muted text-sm mt-3 max-w-sm leading-relaxed">
                                Select a lead from the sidebar to step into the conversation and monitor Albert's performance in real-time.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Overview

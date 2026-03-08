import React, { useMemo, useState, useEffect } from 'react'
import type { Lead, LLMSession } from '../types'
import { StatCard } from '../components/ui/StatCard'
import { LeadCard } from '../components/leads/LeadCard'
import { ActivityFeed } from '../components/albert/ActivityFeed'
import { supabase } from '../lib/supabase'
import {
    Users,
    MessageSquare,
    CalendarCheck,
    TrendingUp,
    DollarSign,
    Zap,
    Cpu,
    Activity
} from 'lucide-react'

import { SkeletonCard } from '../components/ui/SkeletonCard'
import { LeadDetail } from '../components/leads/LeadDetail'

interface OverviewProps {
    leads: Lead[]
    isLoading?: boolean
}

const Overview: React.FC<OverviewProps> = ({ leads, isLoading }) => {
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
    const [sessions, setSessions] = useState<LLMSession[]>([])

    useEffect(() => {
        const fetchSessions = async () => {
            const { data } = await supabase.from('llm_sessions').select('*').order('created_at', { ascending: false })
            if (data) setSessions(data)
        }
        fetchSessions()

        const channel = supabase
            .channel('llm_sessions_realtime')
            .on('postgres_changes' as any, { event: 'INSERT', table: 'llm_sessions' }, (payload: any) => {
                setSessions(prev => [payload.new as LLMSession, ...prev])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
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
            { label: 'Total Leads', value: total, icon: Users, color: 'text-blue-400' },
            { label: 'Active Now', value: active, icon: MessageSquare, color: 'text-amber-400', pulse: active > 0 },
            { label: 'Meetings Booked', value: booked, icon: CalendarCheck, color: 'text-accent' },
            { label: 'Conv. Rate', value: `${rate}%`, icon: TrendingUp, color: 'text-rose-400' },
            { label: 'AI Cost', value: `$${totalCost.toFixed(3)}`, icon: DollarSign, color: 'text-emerald-400' },
            { label: 'AI Latency', value: `${avgLatency}ms`, icon: Zap, color: 'text-purple-400' },
        ]
    }, [leads, sessions])

    const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [leads, selectedLeadId])

    return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
            {/* Header Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Left: Lead Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                            <Users size={14} className="text-accent" /> Recent Activity
                        </h2>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-accent/10 text-accent rounded-full uppercase tracking-widest">Live</span>
                    </div>
                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} height="h-20" />)
                            : leads.map(lead => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    active={selectedLeadId === lead.id}
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    variant="compact"
                                />
                            ))
                        }
                    </div>
                </div>

                {/* Right: Detailed View or Intelligence Placeholder */}
                <div className="lg:col-span-3 h-[750px] bg-bg-card rounded-[32px] border border-border overflow-hidden flex flex-col shadow-2xl relative">
                    {selectedLead ? (
                        <LeadDetail
                            lead={selectedLead}
                            onClose={() => setSelectedLeadId(null)}
                            refetch={() => { }}
                        />
                    ) : (
                        <div className="m-auto flex flex-col items-center text-center p-12 max-w-lg">
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                <div className="relative w-24 h-24 bg-bg-base rounded-[2rem] flex items-center justify-center border border-accent/20 shadow-2xl rotate-3 transform transition-transform hover:rotate-0 duration-500">
                                    <Cpu className="text-accent" size={42} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-bg-elevated rounded-xl border border-border flex items-center justify-center -rotate-12 shadow-xl">
                                    <Activity className="text-purple-400" size={18} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Intelligence Monitoring</h3>
                            <p className="text-muted text-sm mt-4 leading-relaxed">
                                Select a lead from the activity panel to initialize real-time Albert Pulse monitoring.
                                View live conversation threads, BANT signal analysis, and AI reasoning logs.
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-10 w-full text-left">
                                <div className="p-4 bg-white/5 rounded-2xl border border-border/50">
                                    <p className="text-[10px] font-mono text-accent uppercase tracking-widest mb-1">Observability</p>
                                    <p className="text-[11px] text-muted leading-tight">Monitor model latency and token costs per interaction.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-border/50">
                                    <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-1">Synthesis</p>
                                    <p className="text-[11px] text-muted leading-tight">Albert extracts qualification facts in real-time.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: System Pulse */}
            <div className="pt-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                        <Activity size={14} className="text-emerald-400" /> System Pulse Feed
                    </h2>
                </div>
                <ActivityFeed />
            </div>
        </div>
    )
}

export default Overview

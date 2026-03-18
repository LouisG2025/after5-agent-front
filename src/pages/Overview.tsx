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
        <div className="p-8 space-y-12 animate-fade-up max-w-[1700px] mx-auto">
            {/* Header Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
                {/* Left: Lead Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted flex items-center gap-2.5">
                            <Activity size={14} className="text-accent" /> Live Registry
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(46,255,161,0.5)]"></div>
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-3 custom-scrollbar">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} height="h-24" />)
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
                <div className="lg:col-span-3 h-[850px] glass-card !rounded-[48px] border-white/5 overflow-hidden flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] relative bg-[#090b14]/20">
                    {selectedLead ? (
                        <LeadDetail
                            lead={selectedLead}
                            onClose={() => setSelectedLeadId(null)}
                            refetch={() => { }}
                        />
                    ) : (
                        <div className="m-auto flex flex-col items-center text-center p-12 max-w-xl">
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-accent/10 blur-[80px] rounded-full scale-150 animate-pulse"></div>
                                <div className="relative w-28 h-28 glass-card border-accent/20 flex items-center justify-center rotate-6 transform transition-all hover:rotate-0 hover:scale-105 duration-700 shadow-2xl">
                                    <Cpu className="text-accent drop-shadow-[0_0_15px_rgba(46,255,161,0.3)]" size={48} />
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-12 h-12 glass-card border-purple-500/20 flex items-center justify-center -rotate-12 shadow-2xl">
                                    <Activity className="text-purple-400" size={20} />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-white tracking-tight">
                                Neural <span className="text-gradient">Observation</span>
                            </h3>
                            <p className="text-muted font-medium text-sm mt-6 leading-relaxed max-w-md mx-auto">
                                Initialize high-fidelity Albert Monitoring by selecting a registry profile. 
                                Gain real-time visibility into neural extracted signals and conversation telemetry.
                            </p>
                            <div className="grid grid-cols-2 gap-6 mt-12 w-full text-left">
                                <div className="p-5 glass-card border-none bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                                    <p className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Zap size={12} className="group-hover:rotate-12 transition-transform" /> Observability
                                    </p>
                                    <p className="text-[12px] text-muted leading-relaxed font-medium">Quantify model precision, token throughput, and real-time operational costs.</p>
                                </div>
                                <div className="p-5 glass-card border-none bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                                    <p className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <TrendingUp size={12} className="group-hover:scale-110 transition-transform" /> Synthesis
                                    </p>
                                    <p className="text-[12px] text-muted leading-relaxed font-medium">Autonomous extraction of BANT vectors and strategic sales psychological alignment.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: System Pulse */}
            <div className="pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted flex items-center gap-3">
                        <Activity size={16} className="text-accent" /> System Telemetry Feed
                    </h2>
                    <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest">Real-time Stream / Node 01</span>
                </div>
                <ActivityFeed />
            </div>
        </div>
    )
}

export default Overview

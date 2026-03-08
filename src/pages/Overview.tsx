import React, { useMemo, useState } from 'react'
import type { Lead } from '../types'
import { StatCard } from '../components/ui/StatCard'
import { LeadCard } from '../components/leads/LeadCard'
import { ActivityFeed } from '../components/albert/ActivityFeed'
import {
    Users,
    MessageSquare,
    CalendarCheck,
    TrendingUp,
    LayoutDashboard
} from 'lucide-react'

import { SkeletonCard } from '../components/ui/SkeletonCard'

interface OverviewProps {
    leads: Lead[]
    isLoading?: boolean
}

const Overview: React.FC<OverviewProps> = ({ leads, isLoading }) => {
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

    const stats = useMemo(() => {
        const total = leads.length
        const active = leads.filter(l => l.outcome === 'In Progress').length
        const booked = leads.filter(l => l.outcome === 'Meeting Booked').length
        const rate = total > 0 ? ((booked / total) * 100).toFixed(1) : '0.0'

        return [
            { label: 'Total Leads', value: total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Active Now', value: active, icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-400/10', pulse: active > 0 },
            { label: 'Meetings Booked', value: booked, icon: CalendarCheck, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Conversion Rate', value: `${rate}%`, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        ]
    }, [leads])

    return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 border-r border-border pr-8 space-y-6">
                    <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                        <Users size={14} /> Recent Leads
                    </h2>
                    <div className="space-y-3">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} height="h-20" />)
                            : leads.slice(0, 8).map(lead => (
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

                <div className="lg:col-span-2 h-[600px] bg-bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-2xl">
                    {selectedLeadId ? (
                        <div className="p-8 text-center text-muted italic">
                            {/* LeadDetail component will go here */}
                            LeadDetail implementation coming next...
                        </div>
                    ) : (
                        <div className="m-auto flex flex-col items-center text-center p-8">
                            <div className="w-20 h-20 bg-bg-base rounded-full flex items-center justify-center border border-border border-dashed mb-6 opacity-20">
                                <LayoutDashboard className="text-accent" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Select a lead</h3>
                            <p className="text-muted text-sm mt-2 max-w-xs leading-relaxed">
                                Pick a lead from the recent activity to monitor Albert's conversation in real-time.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <ActivityFeed />
            </div>
        </div>
    )
}

export default Overview

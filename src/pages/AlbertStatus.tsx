import React, { useState, useEffect, useMemo } from 'react'
import type { ConversationState, Booking, Message, Lead } from '../types'
import { supabase } from '../lib/supabase'
import { StatCard } from '../components/ui/StatCard'
import { StateDistribution } from '../components/albert/StateDistribution'
import { SourcePerformance } from '../components/albert/SourcePerformance'
import { Activity, Zap, Target, Award } from 'lucide-react'

const AlbertStatus: React.FC = () => {
    const [states, setStates] = useState<ConversationState[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])
    const [leads, setLeads] = useState<Lead[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: sData } = await supabase.from('conversation_state').select('*')
                const { data: mData } = await supabase.from('messages').select('*')
                const { data: bData } = await supabase.from('bookings').select('*')
                const { data: lData } = await supabase.from('leads').select('*')

                setStates(sData as any || [])
                setMessages(mData as any || [])
                setBookings(bData || [])
                setLeads(lData as any || [])
            } catch (err) {
                console.error('Error fetching analytics:', err)
            }
        }
        fetchData()
    }, [])

    const analytics = useMemo(() => {
        const totalMsgs = messages.length
        const totalBookings = bookings.length

        // State distribution
        const stateCounts = states.reduce((acc, curr) => {
            const name = curr.current_state || 'Opening'
            acc[name] = (acc[name] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const distribution = Object.entries(stateCounts).map(([name, count]) => ({
            name,
            count,
            percent: states.length > 0 ? Math.round((count / states.length) * 100) : 0
        })).sort((a, b) => b.count - a.count)

        // Source performance — computed from real leads + bookings
        const bookedLeadIds = new Set(bookings.map(b => b.lead_id))
        const sourceMap = leads.reduce((acc, lead) => {
            const src = lead.lead_source || 'Other'
            if (!acc[src]) acc[src] = { total: 0, booked: 0 }
            acc[src].total += 1
            if (bookedLeadIds.has(lead.id)) acc[src].booked += 1
            return acc
        }, {} as Record<string, { total: number; booked: number }>)

        const sourcePerformance = Object.entries(sourceMap).map(([source, { total, booked }]) => ({
            source,
            total,
            booked,
            rate: total > 0 ? Math.round((booked / total) * 100).toString() : '0'
        })).sort((a, b) => b.total - a.total)

        return {
            totalMsgs,
            totalBookings,
            distribution,
            sourcePerformance
        }
    }, [states, messages, bookings, leads])

    const stats = [
        { label: 'Conversations', value: states.length, icon: Activity, color: 'accent' },
        { label: 'Total Messages', value: analytics.totalMsgs, icon: Zap, color: 'blue-500' },
        { label: 'Bookings Gen', value: analytics.totalBookings, icon: Target, color: 'emerald-500' },
        { label: 'Efficiency', value: '98.4%', icon: Award, color: 'amber-500' },
    ]

    return (
        <div className="p-8 space-y-12 animate-fade-up h-full overflow-y-auto pb-20 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase italic">
                        Albert <span className="text-gradient">Pulse</span>
                    </h1>
                    <p className="text-[10px] text-muted/60 font-black uppercase tracking-[0.3em] mt-2 italic">Neural Network Observability Platform</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-4 py-2 bg-accent/5 border border-accent/20 rounded-2xl shadow-[0_0_20px_rgba(46,255,161,0.05)]">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(46,255,161,0.5)]"></div>
                        <span className="text-[11px] font-black text-accent uppercase tracking-widest">Core Synchronized</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <StatCard
                        key={i}
                        label={s.label}
                        value={s.value}
                        icon={s.icon}
                        accentColor={s.color}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass-card !rounded-[40px] border-white/5 p-10 space-y-10 bg-[#090b14]/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full group-hover:bg-accent/10 transition-all duration-700"></div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted/40 mb-2">Architectural State Vectorization</h2>
                    <StateDistribution data={analytics.distribution} />
                </div>
                <div className="glass-card !rounded-[40px] border-white/5 p-10 space-y-10 bg-[#090b14]/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px] rounded-full group-hover:bg-purple-500/10 transition-all duration-700"></div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted/40 mb-2">Ingestion Source Performance Metrics</h2>
                    {analytics.sourcePerformance.length > 0 ? (
                        <SourcePerformance data={analytics.sourcePerformance} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <Activity size={32} className="text-muted/20" />
                            </div>
                            <p className="text-[10px] text-muted/40 font-black uppercase tracking-widest">Awaiting Registry Data Stream</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AlbertStatus

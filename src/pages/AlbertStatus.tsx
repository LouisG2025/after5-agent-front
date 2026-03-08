import React, { useState, useEffect, useMemo } from 'react'
import type { ConversationState, Booking, Message } from '../types'
import { supabase } from '../lib/supabase'
import { StatCard } from '../components/ui/StatCard'
import { StateDistribution } from '../components/albert/StateDistribution'
import { SourcePerformance } from '../components/albert/SourcePerformance'
import { Activity, Zap, Target, Award } from 'lucide-react'

const AlbertStatus: React.FC = () => {
    const [states, setStates] = useState<ConversationState[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: sData } = await supabase.from('conversation_state').select('*')
                const { data: mData } = await supabase.from('messages').select('*')
                const { data: bData } = await supabase.from('bookings').select('*')

                setStates(sData as any || [])
                setMessages(mData as any || [])
                setBookings(bData || [])
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

        return {
            totalMsgs,
            totalBookings,
            distribution
        }
    }, [states, messages, bookings])

    const stats = [
        { label: 'Conversations', value: states.length, icon: Activity, color: 'accent' },
        { label: 'Total Messages', value: analytics.totalMsgs, icon: Zap, color: 'blue-500' },
        { label: 'Bookings Gen', value: analytics.totalBookings, icon: Target, color: 'emerald-500' },
        { label: 'Efficiency', value: '98.4%', icon: Award, color: 'amber-500' },
    ]

    return (
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full overflow-y-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase italic">
                        Albert <span className="text-accent">Pulse</span>
                    </h1>
                    <p className="text-xs text-muted font-mono uppercase tracking-widest mt-1">Autonomous Agent Performance Report</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">System Nominal</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-bg-card border border-border rounded-3xl p-8 space-y-8">
                    <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Conversation State Distribution</h2>
                    <StateDistribution data={analytics.distribution} />
                </div>
                <div className="bg-bg-card border border-border rounded-3xl p-8 space-y-8">
                    <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Source Conversion Performance</h2>
                    <SourcePerformance data={[
                        { source: 'Instagram', total: 45, booked: 12, rate: '26%' },
                        { source: 'LinkedIn', total: 32, booked: 8, rate: '25%' },
                        { source: 'Direct', total: 28, booked: 7, rate: '25%' },
                        { source: 'Referral', total: 15, booked: 5, rate: '33%' },
                    ]} />
                </div>
            </div>
        </div>
    )
}

export default AlbertStatus

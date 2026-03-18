import React, { useState, useEffect, useMemo } from 'react'
import type { Lead, Booking } from '../types'
import { supabase } from '../lib/supabase'
import { StatCard } from '../components/ui/StatCard'
import { BookingsTable } from '../components/bookings/BookingsTable'
import { LeadDetail } from '../components/leads/LeadDetail'
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react'

interface BookingsProps {
    leads: Lead[]
    isLoading?: boolean
}

const Bookings: React.FC<BookingsProps> = ({ leads, isLoading: leadsLoading }) => {
    const [bookings, setBookings] = useState<(Booking & { lead?: Lead })[]>([])
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [isBookingsLoading, setIsBookingsLoading] = useState(true)

    useEffect(() => {
        const fetchBookings = async () => {
            setIsBookingsLoading(true)
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .order('booking_time', { ascending: true })

                if (error) throw error

                // Link with leads
                const enriched = (data || []).map(b => ({
                    ...b,
                    lead: leads.find(l => l.id === b.lead_id)
                }))
                setBookings(enriched)
            } catch (err) {
                console.error('Error fetching bookings:', err)
            } finally {
                setIsBookingsLoading(false)
            }
        }

        if (leads.length > 0) {
            fetchBookings()
        } else if (!leadsLoading) {
            setIsBookingsLoading(false)
        }
    }, [leads, leadsLoading])

    const stats = useMemo(() => {
        const total = bookings.length
        const confirmed = bookings.filter(b => b.status === 'confirmed').length
        const pending = bookings.filter(b => b.status === 'pending').length
        const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0

        return [
            { label: 'Total Bookings', value: total, icon: Calendar, color: 'accent' },
            { label: 'Confirmed', value: confirmed, icon: CheckCircle, color: 'blue-500' },
            { label: 'Pending', value: pending, icon: Clock, color: 'amber-500' },
            { label: 'Success Rate', value: `${rate}%`, icon: Users, color: 'emerald-500' },
        ]
    }, [bookings])

    return (
        <div className="p-8 space-y-12 animate-fade-up h-full overflow-y-auto pb-20 max-w-[1700px] mx-auto">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase italic">
                        Meeting <span className="text-gradient">Schedule</span>
                    </h1>
                    <p className="text-[10px] text-muted/60 font-black uppercase tracking-[0.3em] mt-2 italic">Neural Calendar Synchronization Stream</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 px-4 py-2 bg-accent/5 border border-accent/20 rounded-2xl shadow-[0_0_20px_rgba(46,255,161,0.05)]">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(46,255,161,0.5)]"></div>
                        <span className="text-[11px] font-black text-accent uppercase tracking-widest">Logic Calibrated</span>
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

            <div className="glass-card !rounded-[48px] border-white/5 overflow-hidden shadow-2xl bg-[#090b14]/10 relative">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <Calendar size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight italic uppercase">Synchronized Events</h2>
                            <p className="text-[10px] text-muted/40 font-black uppercase tracking-widest mt-1 italic">Real-time scheduling telemetry from Calendly Node</p>
                        </div>
                    </div>
                </div>

                <div className="p-2">
                    <BookingsTable
                        bookings={bookings}
                        isLoading={isBookingsLoading}
                        onViewLead={setSelectedLead}
                    />
                </div>
            </div>

            {/* Lead Detail Drawer for Bookings */}
            {selectedLead && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div
                        className="absolute inset-0 bg-[#06080f]/80 backdrop-blur-xl animate-in fade-in duration-500"
                        onClick={() => setSelectedLead(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-[#090b14] border-l border-white/10 h-full animate-in slide-in-from-right duration-700 shadow-[-32px_0_64px_-12px_rgba(0,0,0,0.8)]">
                        <div className="h-full overflow-hidden">
                            <LeadDetail
                                lead={selectedLead}
                                onClose={() => setSelectedLead(null)}
                                refetch={() => { }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Bookings

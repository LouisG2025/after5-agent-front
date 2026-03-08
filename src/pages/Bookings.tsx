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
        <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full overflow-y-auto">
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

            <div className="bg-bg-card border border-border rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Calendar size={20} className="text-accent" />
                        Meeting Schedule
                    </h2>
                </div>

                <BookingsTable
                    bookings={bookings}
                    isLoading={isBookingsLoading}
                    onViewLead={setSelectedLead}
                />
            </div>

            {/* Lead Detail Drawer for Bookings */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setSelectedLead(null)}
                    />
                    <div className="relative w-full max-w-2xl bg-bg-card border-l border-border h-full animate-in slide-in-from-right duration-500">
                        <LeadDetail
                            lead={selectedLead}
                            onClose={() => setSelectedLead(null)}
                            refetch={() => { }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Bookings

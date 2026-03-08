import React from 'react'
import type { Booking, Lead } from '../../types'
import { Badge } from '../ui/Badge'
import { Calendar, ChevronRight } from 'lucide-react'

interface BookingsTableProps {
    bookings: (Booking & { lead?: Lead })[]
    onViewLead: (lead: Lead) => void
    isLoading?: boolean
}

export const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, onViewLead }) => {
    return (
        <div className="bg-bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-bg-sidebar/30 border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Lead Name</th>
                            <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Company</th>
                            <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Scheduled For</th>
                            <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Calendly ID</th>
                            <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Status</th>
                            <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="group hover:bg-white/[0.01] transition-all">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-[10px] font-bold text-accent border border-accent/10">
                                            {booking.lead?.first_name?.[0]}{booking.lead?.last_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{booking.lead?.first_name} {booking.lead?.last_name}</p>
                                            <p className="text-[10px] text-muted font-mono uppercase mt-0.5 tracking-tighter">{booking.lead?.lead_source}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm text-white/80">{booking.lead?.company || '—'}</p>
                                    <p className="text-[10px] text-muted lowercase mt-0.5">{booking.lead?.industry}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-accent/60" />
                                        <span className={`text-sm font-medium ${new Date(booking.scheduled_at) > new Date() ? 'text-accent' : 'text-muted'
                                            }`}>
                                            {new Date(booking.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <code
                                        className="text-[10px] font-mono bg-bg-base px-2 py-1 rounded-md text-muted/80 border border-border"
                                        title={booking.calendly_event_id}
                                    >
                                        {booking.calendly_event_id.slice(0, 16)}...
                                    </code>
                                </td>
                                <td className="px-6 py-5">
                                    <Badge variant="state" value={booking.status.toUpperCase()} label="Status" />
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => booking.lead && onViewLead(booking.lead)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-accent/10 text-muted hover:text-accent border border-border hover:border-accent/20 transition-all text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        View Lead <ChevronRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                            <Calendar size={32} />
                        </div>
                        <p className="text-muted text-sm italic">No bookings found for the current filter.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

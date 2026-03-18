import React from 'react'
import type { Booking, Lead } from '../../types'
import { Badge } from '../ui/Badge'
import { Calendar } from 'lucide-react'

interface BookingsTableProps {
    bookings: (Booking & { lead?: Lead })[]
    onViewLead: (lead: Lead) => void
    isLoading?: boolean
}

export const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, onViewLead }) => {
    return (
        <div className="overflow-hidden border border-white/5 rounded-[32px] bg-[#090b14]/10 shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted/60">Lead Identity</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted/60">Organization</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted/60">Neural Scheduling</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted/60 text-right">Reference</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted/60 text-right">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted/60 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-[11px] font-black text-accent border border-accent/20 shadow-inner uppercase">
                                            {booking.lead?.first_name?.[0]}{booking.lead?.last_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white tracking-tight">{booking.lead?.first_name} {booking.lead?.last_name}</p>
                                            <p className="text-[10px] text-accent font-black uppercase mt-1 tracking-widest">{booking.lead?.lead_source}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-xs font-black text-white/80 tracking-tight uppercase">{booking.lead?.company || 'UNDEFINED'}</p>
                                    <p className="text-[10px] text-muted/40 font-black uppercase mt-1 tracking-tighter italic">{booking.lead?.industry || 'N/A'}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                                            <Calendar size={12} className="text-accent" />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black tracking-tight ${new Date(booking.scheduled_at) > new Date() ? 'text-white' : 'text-muted'}`}>
                                                {new Date(booking.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-[9px] text-muted/40 font-black uppercase tracking-widest mt-1">Confirmed Synchrony</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <code className="text-[10px] font-black font-mono bg-white/5 px-2 py-1 rounded-md text-muted/60 border border-white/5 uppercase">
                                        {booking.calendly_event_id.slice(0, 8)}
                                    </code>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="inline-block scale-90 origin-right">
                                        <Badge variant="state" value={booking.status.toUpperCase()} label="Status" />
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button
                                        onClick={() => booking.lead && onViewLead(booking.lead)}
                                        className="btn-secondary !py-2 !px-4"
                                    >
                                        Inspect Lead
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                    <div className="py-32 text-center space-y-6">
                        <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto opacity-40 shadow-inner">
                            <Calendar size={32} className="text-muted" />
                        </div>
                        <p className="text-muted/40 text-[10px] font-black uppercase tracking-[0.3em] italic">No synchronized bookings detected</p>
                    </div>
                )}
            </div>
        </div>
    )
}

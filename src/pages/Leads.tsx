import React, { useState } from 'react'
import type { Lead } from '../types'
import { LeadsList } from '../components/leads/LeadsList'
import { LeadDetail } from '../components/leads/LeadDetail'
import { Users } from 'lucide-react'

interface LeadsProps {
    leads: Lead[]
    isLoading?: boolean
    refetch: () => void
}

const Leads: React.FC<LeadsProps> = ({ leads, isLoading, refetch }) => {
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null)

    const selectedLead = leads.find(l => l.id === selectedLeadId)

    return (
        <div className="h-[calc(100vh-64px)] flex overflow-hidden lg:p-10 lg:gap-10 animate-fade-up">
            {/* Sidebar list */}
            <div className="w-full lg:w-[450px] flex-shrink-0 glass-card-sidebar !rounded-[48px] overflow-hidden flex flex-col border border-white/5 bg-[#090b14]/20 shadow-2xl">
                <div className="p-10 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[20px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-inner">
                            <Users size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                                Lead <span className="text-gradient">Registry</span>
                            </h1>
                            <p className="text-[10px] text-accent font-black uppercase tracking-[0.3em] mt-2 italic flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-accent animate-pulse"></div>
                                {leads.length} Records Online
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    {isLoading ? (
                         <div className="flex-1 flex flex-col items-center justify-center space-y-8 h-full">
                            <div className="relative">
                                <div className="absolute inset-0 bg-accent/20 blur-[30px] rounded-full scale-150 animate-pulse"></div>
                                <div className="w-12 h-12 border-4 border-accent/10 border-t-accent rounded-full animate-spin relative z-10"></div>
                            </div>
                            <span className="text-[11px] text-accent/40 font-black tracking-[0.4em] uppercase animate-pulse italic">Scanning Central Registry...</span>
                        </div>
                    ) : (
                        <div className="h-full">
                            <LeadsList
                                leads={leads}
                                selectedId={selectedLeadId}
                                onSelect={setSelectedLeadId}
                                isLoading={isLoading}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="hidden lg:flex flex-1 glass-card !rounded-[64px] border border-white/5 overflow-hidden relative shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] bg-[#090b14]/30">
                {selectedLead ? (
                    <div className="w-full h-full backdrop-blur-3xl">
                        <LeadDetail
                            lead={selectedLead}
                            onClose={() => { }}
                            refetch={refetch}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-12">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full scale-150 group-hover:bg-accent/10 transition-all duration-700"></div>
                            <div className="relative w-32 h-32 glass-card !rounded-[40px] border-white/5 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-all duration-1000 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] bg-white/[0.01]">
                                <Users size={56} className="text-muted/10 group-hover:text-accent/20 transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-white/40 uppercase tracking-[0.2em] italic">Awaiting Observation</h3>
                            <p className="text-[11px] text-muted/20 font-black uppercase tracking-[0.3em] leading-relaxed max-w-[300px]">
                                Select a subject from the Neural Registry to initialize deep-dive telemetry analysis.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Leads

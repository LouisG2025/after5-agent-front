import React, { useState } from 'react'
import type { Lead } from '../types'
import { LeadsList } from '../components/leads/LeadsList'
import { LeadDetail } from '../components/leads/LeadDetail'
import { MessageSquare } from 'lucide-react'

interface ConversationsProps {
    leads: Lead[]
    isLoading?: boolean
    refetch: () => void
}

const Conversations: React.FC<ConversationsProps> = ({ leads, isLoading, refetch }) => {
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null)

    const selectedLead = leads.find(l => l.id === selectedLeadId)

    return (
        <div className="h-[calc(100vh-64px)] flex overflow-hidden lg:p-8 lg:gap-8 animate-fade-up">
            <div className="w-full lg:w-[450px] flex-shrink-0 glass-card-sidebar border border-white/5 lg:rounded-[40px] overflow-hidden flex flex-col shadow-2xl bg-[#090b14]/10">
                <div className="p-10 border-b border-white/5 bg-white/[0.01]">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase italic flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <MessageSquare size={22} />
                        </div>
                        Live <span className="text-gradient">Discussions</span>
                    </h1>
                    <p className="text-[10px] text-muted/40 font-black uppercase tracking-[0.3em] mt-3 italic mb-1">
                        Neural Telemetry Hub
                    </p>
                    <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-accent/5 border border-accent/20 rounded-xl w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">{leads.length} ACTIVE THREADS</span>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <LeadsList
                        leads={leads}
                        selectedId={selectedLeadId}
                        onSelect={setSelectedLeadId}
                        isLoading={isLoading}
                        mode="conversations"
                    />
                </div>
            </div>

            <div className="hidden lg:flex flex-1 glass-card !rounded-[56px] border border-white/5 overflow-hidden relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] bg-[#090b14]/20">
                {selectedLead ? (
                    <div className="w-full h-full backdrop-blur-3xl">
                        <LeadDetail
                            lead={selectedLead}
                            onClose={() => { }}
                            refetch={refetch}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent/10 blur-[60px] rounded-full scale-150 animate-pulse"></div>
                            <div className="relative w-20 h-20 glass-card border-white/5 flex items-center justify-center rotate-12 group hover:rotate-0 transition-transform duration-700 shadow-2xl">
                                <MessageSquare size={32} className="text-muted/20" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-lg font-black text-white/40 uppercase tracking-[0.2em] italic">Awaiting Synchrony</h3>
                            <p className="text-[10px] text-muted/20 font-black uppercase tracking-widest leading-relaxed max-w-[200px]">
                                Initialize observation by selecting an active discussion thread from the Registry.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Conversations

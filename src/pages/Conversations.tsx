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
        <div className="h-[calc(100vh-64px)] flex overflow-hidden lg:p-6 lg:gap-6 animate-in fade-in duration-700">
            <div className="w-full lg:w-96 flex-shrink-0 bg-bg-sidebar/30 border border-border lg:rounded-3xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border">
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        <MessageSquare size={20} className="text-accent" />
                        Live Discussions
                    </h1>
                    <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
                        {leads.length} ACTIVE THREADS
                    </p>
                </div>
                <div className="flex-1 overflow-hidden">
                    <LeadsList
                        leads={leads}
                        selectedId={selectedLeadId}
                        onSelect={setSelectedLeadId}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            <div className="hidden lg:flex flex-1 bg-bg-card border border-border rounded-3xl overflow-hidden relative">
                {selectedLead ? (
                    <LeadDetail
                        lead={selectedLead}
                        onClose={() => { }}
                        refetch={refetch}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 opacity-20">
                        <MessageSquare size={48} />
                        <p className="text-sm font-medium">Select a conversation to view thread</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Conversations

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
        <div className="h-[calc(100vh-64px)] flex overflow-hidden lg:p-6 lg:gap-6 animate-in fade-in duration-700">
            <div className="w-full lg:w-96 flex-shrink-0 bg-bg-sidebar/30 border border-border lg:rounded-3xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border">
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        <Users size={20} className="text-accent" />
                        Leads Management
                    </h1>
                    <p className="text-[10px] text-muted font-mono uppercase tracking-widest mt-1">
                        {leads.length} TOTAL PROFILES
                    </p>
                </div>
                <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                         <div className="flex-1 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <LeadsList
                            leads={leads}
                            selectedId={selectedLeadId}
                            onSelect={setSelectedLeadId}
                            isLoading={isLoading}
                        />
                    )}
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
                        <Users size={48} />
                        <p className="text-sm font-medium">Select a lead to view details</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Leads

import React, { useState, useMemo } from 'react'
import type { Lead } from '../../types'
import { LeadCard } from './LeadCard'
import { Search } from 'lucide-react'

interface LeadsListProps {
    leads: Lead[]
    selectedId: string | null
    onSelect: (id: string) => void
    mode?: 'all' | 'conversations'
    isLoading?: boolean
}

export const LeadsList: React.FC<LeadsListProps> = ({
    leads,
    selectedId,
    onSelect,
    mode = 'all'
}) => {
    const [search, setSearch] = useState('')
    const [tempFilter, setTempFilter] = useState('All')
    const [outcomeFilter, setOutcomeFilter] = useState('All')
    const [sortBy, setSortBy] = useState<'newest' | 'active' | 'signal'>('newest')

    const filteredLeads = useMemo(() => {
        return leads
            .filter(l => {
                const matchesSearch = `${l.first_name} ${l.last_name} ${l.company}`.toLowerCase().includes(search.toLowerCase())
                const matchesTemp = tempFilter === 'All' || l.temperature === tempFilter
                const matchesOutcome = outcomeFilter === 'All' || l.outcome === outcomeFilter
                return matchesSearch && matchesTemp && matchesOutcome
            })
            .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                if (sortBy === 'signal') return b.signal_score - a.signal_score
                // For active, we'd ideally use last_active_at from conversation_state
                return 0
            })
    }, [leads, search, tempFilter, outcomeFilter, sortBy])

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border space-y-4 bg-bg-sidebar/20">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search name, company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-bg-base border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        value={tempFilter}
                        onChange={(e) => setTempFilter(e.target.value)}
                        className="flex-1 bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted outline-none focus:border-accent/30"
                    >
                        <option value="All">All Temps</option>
                        <option value="Hot">Hot</option>
                        <option value="Warm">Warm</option>
                        <option value="Cold">Cold</option>
                    </select>
                    <select
                        value={outcomeFilter}
                        onChange={(e) => setOutcomeFilter(e.target.value)}
                        className="flex-1 bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted outline-none focus:border-accent/30"
                    >
                        <option value="All">All Outcomes</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Meeting Booked">Booked</option>
                        <option value="Not Interested">Dropped</option>
                    </select>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-muted uppercase tracking-widest pt-1">
                    <span>{filteredLeads.length} Leads</span>
                    <div className="flex gap-3">
                        <button onClick={() => setSortBy('newest')} className={sortBy === 'newest' ? 'text-accent' : ''}>Newest</button>
                        <button onClick={() => setSortBy('signal')} className={sortBy === 'signal' ? 'text-accent' : ''}>Signal</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredLeads.map((lead) => (
                    <LeadCard
                        key={lead.id}
                        lead={lead}
                        active={selectedId === lead.id}
                        onClick={() => onSelect(lead.id)}
                        showState={mode === 'conversations'}
                    />
                ))}
                {filteredLeads.length === 0 && (
                    <div className="py-20 text-center opacity-20 italic text-sm">
                        No leads matching filters
                    </div>
                )}
            </div>
        </div>
    )
}

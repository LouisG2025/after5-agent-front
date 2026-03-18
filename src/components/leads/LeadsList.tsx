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
        <div className="flex flex-col h-full bg-[#090b14]/10">
            <div className="p-8 border-b border-white/5 space-y-6 bg-white/[0.01]">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Neural Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-accent/40 focus:bg-white/[0.05] outline-none transition-all placeholder:text-muted/20 font-medium tracking-tight"
                    />
                </div>

                <div className="flex gap-3">
                    <select
                        value={tempFilter}
                        onChange={(e) => setTempFilter(e.target.value)}
                        className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest text-muted/40 outline-none focus:border-accent/40 focus:text-accent appearance-none cursor-pointer hover:bg-white/[0.06] transition-all text-center"
                    >
                        <option value="All" className="bg-[#090b14] text-white">All Tiers</option>
                        <option value="Hot" className="bg-[#090b14] text-white">Hot</option>
                        <option value="Warm" className="bg-[#090b14] text-white">Warm</option>
                        <option value="Cold" className="bg-[#090b14] text-white">Cold</option>
                    </select>
                    <select
                        value={outcomeFilter}
                        onChange={(e) => setOutcomeFilter(e.target.value)}
                        className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest text-muted/40 outline-none focus:border-accent/40 focus:text-accent appearance-none cursor-pointer hover:bg-white/[0.06] transition-all text-center"
                    >
                        <option value="All" className="bg-[#090b14] text-white">All Metrics</option>
                        <option value="In Progress" className="bg-[#090b14] text-white">In Progress</option>
                        <option value="Meeting Booked" className="bg-[#090b14] text-white">Booked</option>
                        <option value="Not Interested" className="bg-[#090b14] text-white">Dropped</option>
                    </select>
                </div>

                <div className="flex items-center justify-between text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] px-1">
                    <span className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-accent/40"></div>
                        {filteredLeads.length} Registry Objects
                    </span>
                    <div className="flex gap-4">
                        <button onClick={() => setSortBy('newest')} className={`transition-colors hover:text-white ${sortBy === 'newest' ? 'text-accent' : ''}`}>Newest</button>
                        <button onClick={() => setSortBy('signal')} className={`transition-colors hover:text-white ${sortBy === 'signal' ? 'text-accent' : ''}`}>Signal</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {filteredLeads.map((lead, idx) => (
                    <div key={lead.id} className="animate-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
                        <LeadCard
                            lead={lead}
                            active={selectedId === lead.id}
                            onClick={() => onSelect(lead.id)}
                            showState={mode === 'conversations'}
                        />
                    </div>
                ))}
                {filteredLeads.length === 0 && (
                    <div className="py-32 text-center space-y-4 opacity-40">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Search size={20} className="text-muted" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Signal match: 0%</p>
                    </div>
                )}
            </div>
        </div>
    )
}

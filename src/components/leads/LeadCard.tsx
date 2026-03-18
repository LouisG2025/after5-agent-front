import React from 'react'
import type { Lead, ConversationState } from '../../types'
import { Badge } from '../ui/Badge'
import { Phone, Building2, Target, Wallet, UserCheck, Clock } from 'lucide-react'

interface LeadCardProps {
    lead: Lead
    active?: boolean
    onClick: () => void
    variant?: 'compact' | 'full'
    state?: ConversationState
    showState?: boolean
}

export const LeadCard: React.FC<LeadCardProps> = ({
    lead,
    active,
    onClick,
    variant = 'full',
    state,
    showState
}) => {
    const isCompact = variant === 'compact'

    return (
        <button
            onClick={onClick}
            className={`
        w-full text-left p-5 rounded-[24px] border transition-all duration-500 relative overflow-hidden group
        ${active
                    ? 'bg-accent/10 border-accent/40 shadow-[0_0_20px_rgba(46,255,161,0.1)]'
                    : 'glass-card border-white/5 hover:bg-white/[0.04] hover:border-white/10'}
      `}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_15px_rgba(46,255,161,0.4)]"></div>}

            <div className="flex justify-between items-start mb-3">
                <div className="min-w-0">
                    <h4 className={`font-black tracking-tight text-white truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
                        {lead.first_name || lead.last_name ? `${lead.first_name} ${lead.last_name}` : 'New Lead'}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center">
                            <Phone size={10} className="text-accent" />
                        </div>
                        <p className="text-[10px] text-muted font-bold tracking-widest uppercase">
                            {lead.phone}
                        </p>
                    </div>
                    {lead.company && (
                        <div className="flex items-center gap-2 mt-1.5">
                            <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center">
                                <Building2 size={10} className="text-muted" />
                            </div>
                            <p className="text-[10px] text-muted/60 font-bold uppercase tracking-widest truncate">
                                {lead.company}
                            </p>
                        </div>
                    )}
                </div>
                {!isCompact && <div className="scale-90 origin-top-right"><Badge variant="temperature" value={lead.temperature} /></div>}
            </div>

            {!isCompact && (
                <div className="flex flex-wrap items-center gap-2 mt-5">
                    <div className="scale-90 origin-left"><Badge variant="outcome" value={lead.outcome} label="Outcome" /></div>
                    {showState && state && <div className="scale-90 origin-left"><Badge variant="state" value={state.current_state} label="State" /></div>}
                </div>
            )}

            <div className="flex items-center justify-between mt-5">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-muted/40 uppercase tracking-[0.1em]">
                        {Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / 60000)}m ago
                    </span>
                    {/* BANT Quick Indicators */}
                    {state && (
                        <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-white/[0.03] border border-white/5">
                            <Wallet size={12} className={state.bant_budget ? 'text-accent drop-shadow-[0_0_5px_rgba(46,255,161,0.5)]' : 'text-muted/10'} />
                            <UserCheck size={12} className={state.bant_authority ? 'text-accent drop-shadow-[0_0_5px_rgba(46,255,161,0.5)]' : 'text-muted/10'} />
                            <Target size={12} className={state.bant_need ? 'text-accent drop-shadow-[0_0_5px_rgba(46,255,161,0.5)]' : 'text-muted/10'} />
                            <Clock size={12} className={state.bant_timeline ? 'text-accent drop-shadow-[0_0_5px_rgba(46,255,161,0.5)]' : 'text-muted/10'} />
                        </div>
                    )}
                </div>
                {lead.outcome === 'In Progress' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot"></div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.02]">
                <div
                    className={`h-full transition-all duration-1000 shadow-[0_-5px_10px_rgba(0,0,0,0.2)] ${lead.signal_score >= 7 ? 'bg-accent' : lead.signal_score >= 4 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                    style={{ width: `${lead.signal_score * 10}%` }}
                ></div>
            </div>
        </button>
    )
}

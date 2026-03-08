import React from 'react'
import type { Lead, ConversationState } from '../../types'
import { Badge } from '../ui/Badge'

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
        w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group
        ${active
                    ? 'bg-accent/5 border-accent/40 shadow-[0_0_20px_rgba(46,255,161,0.05)]'
                    : 'bg-bg-card border-border hover:border-accent/30'}
      `}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_rgba(46,255,161,0.5)]"></div>}

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className={`font-bold leading-none text-white ${isCompact ? 'text-xs' : 'text-sm'}`}>
                        {lead.first_name || lead.last_name ? `${lead.first_name} ${lead.last_name}` : 'New Lead'}
                    </h4>
                    <p className="text-[10px] text-accent/70 font-mono mt-1.5 tracking-tight shrink-0">
                        {lead.phone}
                    </p>
                    {lead.company && (
                        <p className="text-[10px] text-muted font-mono uppercase mt-1 tracking-tight shrink-0">
                            {lead.company}
                        </p>
                    )}
                </div>
                <Badge variant="temperature" value={lead.temperature} />
            </div>

            {!isCompact && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Badge variant="outcome" value={lead.outcome} label="Outcome" />
                    {showState && state && <Badge variant="state" value={state.current_state} label="State" />}
                </div>
            )}

            <div className="flex items-center justify-between mt-4">
                <span className="text-[9px] font-mono text-muted uppercase tracking-tighter">
                    {Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / 60000)}m ago
                </span>
                {lead.outcome === 'In Progress' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot"></div>
                )}
            </div>

            {!isCompact && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                    <div
                        className={`h-full transition-all duration-1000 ${lead.signal_score >= 7 ? 'bg-accent' : lead.signal_score >= 4 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                        style={{ width: `${lead.signal_score * 10}%` }}
                    ></div>
                </div>
            )}
        </button>
    )
}

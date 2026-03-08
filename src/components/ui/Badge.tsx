import React from 'react'

type BadgeVariant = 'temperature' | 'outcome' | 'source' | 'state' | 'default'

interface BadgeProps {
    label?: string
    variant?: BadgeVariant
    value?: string
}

const colorMaps: Record<string, string> = {
    // Temperature
    'Hot': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Warm': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Cold': 'bg-blue-500/10 text-blue-500 border-blue-500/20',

    // Outcome
    'In Progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Meeting Booked': 'bg-accent/10 text-accent border-accent/20',
    'Not Interested': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Disqualified': 'bg-gray-500/10 text-gray-500 border-gray-500/20',

    // Source
    'Google': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Meta': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'Referral': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    'Other': 'bg-gray-500/10 text-gray-500 border-gray-500/20',

    // Conversation State
    'Opening': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'Discovery': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    'Qualification': 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    'Intent Building': 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
    'Booking Push': 'bg-accent/10 text-accent border-accent/20',
    'Awaiting': 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    'Confirmed': 'bg-green-400/10 text-green-400 border-green-400/20',
    'Escalation': 'bg-red-400/10 text-red-400 border-red-400/20',
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', value }) => {
    const displayLabel = value || label || ''
    const colorClass = (colorMaps as Record<string, string>)[displayLabel] || (variant === 'default' ? 'bg-bg-elevated text-muted border-border' : 'bg-bg-sidebar/50 text-muted/50 border-border/50')

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${colorClass}`}>
            {displayLabel}
        </span>
    )
}

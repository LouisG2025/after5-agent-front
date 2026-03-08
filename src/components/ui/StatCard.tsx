import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    accentColor: string
    pulse?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, accentColor, pulse }) => {
    return (
        <div className="bg-bg-card p-6 rounded-2xl border border-border group hover:border-accent/40 transition-all duration-300">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-white/5 ${accentColor}`}>
                <Icon size={20} />
            </div>
            <p className="text-muted text-[10px] uppercase font-mono tracking-widest mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold font-mono text-white">{value}</h3>
                {pulse && <div className="w-2 h-2 rounded-full bg-accent pulse-dot"></div>}
            </div>
        </div>
    )
}

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
        <div className="glass-card p-6 group hover:border-accent/40 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 bg-white/[0.03] border border-white/5 shadow-inner ${accentColor}`}>
                <Icon size={22} />
            </div>
            <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
                {pulse && <div className="w-2 h-2 rounded-full bg-accent pulse-dot"></div>}
            </div>
        </div>
    )
}

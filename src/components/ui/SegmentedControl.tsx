import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface Option {
    id: string
    label: string
    icon?: LucideIcon
}

interface SegmentedControlProps {
    options: (string | Option)[]
    activeId: string
    onChange: (id: string) => void
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, activeId, onChange }) => {
    return (
        <div className="flex p-1 bg-bg-base border border-border rounded-xl">
            {options.map((option) => {
                const id = typeof option === 'string' ? option : option.id
                const label = typeof option === 'string' ? option : option.label
                const Icon = typeof option === 'string' ? null : option.icon
                const isActive = activeId === id

                return (
                    <button
                        key={id}
                        onClick={() => onChange(id)}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${isActive
                            ? 'bg-accent text-bg-base shadow-[0_0_10px_rgba(46,255,161,0.2)]'
                            : 'text-muted hover:text-white'
                            }`}
                    >
                        {Icon && <Icon size={12} />}
                        {label}
                    </button>
                )
            })}
        </div>
    )
}

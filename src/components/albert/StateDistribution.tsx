import React from 'react'
import { Badge } from '../ui/Badge'

interface StateCount {
    name: string
    count: number
    percent: number
}

interface StateDistributionProps {
    data: StateCount[]
}

export const StateDistribution: React.FC<StateDistributionProps> = ({ data }) => {
    return (
        <div className="bg-bg-card rounded-2xl border border-border p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Conversation State Split</h3>
                <span className="text-[10px] text-muted font-mono uppercase tracking-widest">Leads by State</span>
            </div>

            <div className="space-y-6">
                {data.map((item) => (
                    <div key={item.name} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <Badge variant="state" value={item.name as any} label="State" />
                            <div className="flex gap-4 font-mono text-[10px]">
                                <span className="text-white font-bold">{item.count}</span>
                                <span className="text-muted">{item.percent}%</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent opacity-80 rounded-full transition-all duration-1000"
                                style={{ width: `${item.percent}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

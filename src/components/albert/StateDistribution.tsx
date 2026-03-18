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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Neural State Propagation</h3>
                <span className="text-[10px] text-muted/60 font-black uppercase tracking-widest italic">Vector Distribution</span>
            </div>

            <div className="space-y-7">
                {data.map((item, idx) => (
                    <div key={item.name} className="space-y-3 animate-fade-up" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex justify-between items-center text-xs">
                            <div className="scale-90 origin-left">
                                <Badge variant="state" value={item.name as any} label="State" />
                            </div>
                            <div className="flex gap-4 font-black text-[10px] tracking-tight">
                                <span className="text-white bg-white/5 px-2 py-0.5 rounded-md border border-white/5 shadow-inner">{item.count}</span>
                                <span className="text-accent pt-0.5">{item.percent}%</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <div
                                className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(46,255,161,0.3)]"
                                style={{ width: `${item.percent}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

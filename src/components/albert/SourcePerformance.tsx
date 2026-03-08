import React from 'react'

interface SourceStat {
    source: string
    total: number
    booked: number
    rate: string
}

interface SourcePerformanceProps {
    data: SourceStat[]
}

export const SourcePerformance: React.FC<SourcePerformanceProps> = ({ data }) => {
    // highlighted best row
    const bestSource = [...data].sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate))[0]?.source

    return (
        <div className="bg-bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-bg-sidebar/30 border-b border-border">
                        <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Source</th>
                        <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Total Leads</th>
                        <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted">Booked</th>
                        <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted text-right">Conv. Rate</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                    {data.map((row) => (
                        <tr key={row.source} className={`group hover:bg-white/[0.01] transition-all ${row.source === bestSource ? 'relative' : ''}`}>
                            {row.source === bestSource && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_rgba(46,255,161,0.5)]"></div>
                            )}
                            <td className="px-6 py-4 text-sm font-bold text-white">{row.source}</td>
                            <td className="px-6 py-4 text-sm text-white/60 font-mono">{row.total}</td>
                            <td className="px-6 py-4 text-sm text-white/60 font-mono">{row.booked}</td>
                            <td className="px-6 py-4 text-right">
                                <span className={`text-sm font-bold font-mono ${row.source === bestSource ? 'text-accent' : 'text-white'}`}>
                                    {row.rate}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

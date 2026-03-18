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
        <div className="overflow-hidden border border-white/5 rounded-2xl bg-white/[0.01]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Registry Source</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Total Leads</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted/60">Booked</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted/60 text-right">Yield Rate</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                    {data.map((row) => (
                        <tr key={row.source} className={`group hover:bg-white/[0.02] transition-all duration-300 ${row.source === bestSource ? 'relative' : ''}`}>
                            {row.source === bestSource && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_15px_rgba(46,255,161,0.5)]"></div>
                            )}
                            <td className="px-6 py-5 text-xs font-black text-white tracking-tight uppercase">{row.source}</td>
                            <td className="px-6 py-5 text-xs text-white/60 font-black font-mono tracking-tighter">{row.total}</td>
                            <td className="px-6 py-5 text-xs text-white/60 font-black font-mono tracking-tighter">{row.booked}</td>
                            <td className="px-6 py-5 text-right">
                                <span className={`text-[13px] font-black font-mono tracking-tighter ${row.source === bestSource ? 'text-accent drop-shadow-[0_0_8px_rgba(46,255,161,0.3)]' : 'text-white'}`}>
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

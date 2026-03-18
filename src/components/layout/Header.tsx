import React, { useState, useEffect } from 'react'
import { Menu, CircleAlert } from 'lucide-react'

interface HeaderProps {
    title: string
    isConnected: boolean
    lastUpdated: Date
    leadsCount: number
    onToggleMenu: () => void
}

export const Header: React.FC<HeaderProps> = ({
    title,
    isConnected,
    lastUpdated,
    leadsCount,
    onToggleMenu
}) => {
    const [seconds, setSeconds] = useState(0)

    useEffect(() => {
        const i = setInterval(() => {
            setSeconds(Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000))
        }, 1000)
        return () => clearInterval(i)
    }, [lastUpdated])

    return (
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-black/10 backdrop-blur-3xl sticky top-0 z-30 shadow-[0_1px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-6">
                <button
                    onClick={onToggleMenu}
                    className="lg:hidden w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-muted hover:text-white transition-all border border-white/10"
                >
                    <Menu size={24} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                        <span className="text-gradient">{title}</span> Telemetry
                    </h1>
                    <p className="text-[9px] text-muted/40 font-black uppercase tracking-[0.3em] mt-1 italic">Real-time Data Stream</p>
                </div>
            </div>

            <div className="flex items-center gap-10">
                <div className="hidden md:flex items-center gap-10">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-5 py-2.5 rounded-2xl shadow-inner group hover:bg-white/[0.04] transition-all">
                            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-accent shadow-[0_0_10px_#2effa1] pulse-dot' : 'bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]'}`}></div>
                            <span className={`text-[11px] font-black uppercase tracking-widest italic ${isConnected ? 'text-accent' : 'text-amber-500'}`}>
                                {isConnected ? 'Link Active' : 'Restablishing Link'}
                            </span>
                            <div className="w-px h-4 bg-white/10 mx-2"></div>
                            <span className="text-[10px] text-muted/40 font-black uppercase tracking-widest italic">
                                Sync: {seconds}s
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-accent/5 border border-accent/20 px-6 py-2.5 rounded-2xl shadow-inner group hover:bg-accent/10 transition-all">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[11px] font-black italic text-accent uppercase tracking-widest">
                            {leadsCount} Registered Leads
                        </span>
                    </div>
                </div>

                {!isConnected && (
                    <div className="md:hidden w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <CircleAlert size={18} className="animate-pulse" />
                    </div>
                )}
            </div>
        </header>
    )
}

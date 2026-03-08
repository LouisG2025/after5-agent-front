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
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-bg-base/80 backdrop-blur sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleMenu}
                    className="lg:hidden p-2 -ml-2 text-muted hover:text-white transition-colors"
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 text-[10px] font-mono uppercase tracking-[0.15em]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-accent pulse-dot' : 'bg-amber-500 animate-pulse'}`}></div>
                            <span className={isConnected ? 'text-accent font-bold' : 'text-amber-500'}>
                                {isConnected ? 'Live Status' : 'Reconnecting...'}
                            </span>
                        </div>
                        <span className="text-muted border-l border-border pl-4">
                            Updated {seconds}s ago
                        </span>
                    </div>

                    <div className="px-3 py-1 bg-bg-elevated border border-border rounded-full text-white/80">
                        {leadsCount} Leads
                    </div>
                </div>

                {!isConnected && (
                    <div className="md:hidden flex items-center gap-2 text-amber-500">
                        <CircleAlert size={14} className="animate-pulse" />
                    </div>
                )}
            </div>
        </header>
    )
}

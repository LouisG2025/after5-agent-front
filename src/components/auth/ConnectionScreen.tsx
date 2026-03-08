import React, { useState } from 'react'
import { Database, ShieldCheck, ArrowRight, Activity } from 'lucide-react'

interface ConnectionScreenProps {
    onConnect: (url: string, key: string) => void
}

export const ConnectionScreen: React.FC<ConnectionScreenProps> = ({ onConnect }) => {
    const [url, setUrl] = useState(localStorage.getItem('after5_supabase_url') || '')
    const [key, setKey] = useState(localStorage.getItem('after5_supabase_key') || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (url && key) {
            onConnect(url, key)
        }
    }

    return (
        <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(46,255,161,0.05),transparent_50%)]">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                        <Activity size={16} className="text-accent animate-pulse" />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest font-mono">System Initialization</span>
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
                        Albert <span className="text-accent">Dashboard</span>
                    </h1>
                    <p className="text-muted text-xs uppercase tracking-[0.2em] font-medium">Internal Demo Infrastructure</p>
                </div>

                <div className="bg-[#141a2b] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Database size={120} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-muted uppercase tracking-widest pl-1">Supabase URL</label>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://xyz.supabase.co"
                                    className="w-full bg-[#0b0f1a] border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all placeholder:text-muted/30"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-muted uppercase tracking-widest pl-1">Service Key</label>
                                <input
                                    type="password"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    placeholder="anon-public-key"
                                    className="w-full bg-[#0b0f1a] border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all placeholder:text-muted/30 font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/90 text-[#0b0f1a] font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group/btn"
                        >
                            Connect Infrastructure <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-6 text-[10px] font-mono text-muted/40 uppercase tracking-widest pt-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={12} /> Encrypted Session
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                    <div>v2.4.0 Stable</div>
                </div>
            </div>
        </div>
    )
}

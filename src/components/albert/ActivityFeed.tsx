import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import type { Message, LLMSession } from '../../types'
import { Activity, Brain, MessageCircle, Zap, DollarSign, Cpu } from 'lucide-react'

type FeedItem =
    | { type: 'message'; data: Message }
    | { type: 'ai'; data: LLMSession }

export const ActivityFeed: React.FC = () => {
    const [items, setItems] = useState<FeedItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchLatest = useCallback(async () => {
        try {
            // Fetch messages
            const { data: msgData } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            // Fetch AI Sessions
            const { data: aiData } = await supabase
                .from('llm_sessions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            const combined: FeedItem[] = [
                ...(msgData || []).map(m => ({ type: 'message' as const, data: m })),
                ...(aiData || []).map(a => ({ type: 'ai' as const, data: a }))
            ].sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime())

            setItems(combined.slice(0, 15))
        } catch (err) {
            console.error('Error fetching activity:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchLatest()
        const channel = supabase.channel('activity-feed-realtime')
            .on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchLatest())
            .on('postgres_changes' as any, { event: 'INSERT', schema: 'public', table: 'llm_sessions' }, () => fetchLatest())
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchLatest])

    if (isLoading && items.length === 0) return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse border border-border/50"></div>
            ))}
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="glass-card !rounded-[40px] border-white/5 overflow-hidden shadow-2xl bg-[#090b14]/10">
                <div className="px-8 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Activity size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Neural Telemetry</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted/60 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-accent opacity-50 shadow-[0_0_5px_rgba(46,255,161,0.5)]" /> message
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted/60 uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-purple-500 opacity-50 shadow-[0_0_5px_rgba(168,85,247,0.5)]" /> intelligence
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-white/[0.03] max-h-[600px] overflow-y-auto custom-scrollbar">
                    {items.map((item, idx) => {
                        const isAI = item.type === 'ai'
                        return (
                            <div key={idx} className="px-8 py-6 flex items-center justify-between group hover:bg-white/[0.02] transition-all animate-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
                                <div className="flex items-center gap-6 min-w-0">
                                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-xl ${isAI
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/5'
                                        : item.data.direction === 'inbound'
                                            ? 'bg-white/5 text-muted border-white/10'
                                            : 'bg-accent/10 text-accent border-accent/20 shadow-accent/5'
                                        }`}>
                                        {isAI ? <Cpu size={22} /> : <MessageCircle size={22} />}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <p className="text-[13px] font-black text-white tracking-tight uppercase">
                                                {isAI
                                                    ? 'AI Context Update'
                                                    : item.data.direction === 'inbound' ? 'Customer Message' : 'Albert Response'
                                                }
                                            </p>
                                            <span className="text-[10px] font-black text-muted/30 uppercase tracking-tighter shrink-0 pt-0.5">
                                                / {new Date(item.data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>

                                        <p className="text-xs text-muted/80 truncate mt-1.5 max-w-[350px] md:max-w-[700px] font-medium leading-relaxed italic">
                                            {isAI
                                                ? `Synchronizing ${item.data.conversation_state} state mapping (${item.data.prompt_tokens} tokens committed)`
                                                : item.data.content
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 shrink-0 ml-8">
                                    {isAI && (
                                        <div className="flex items-center gap-6 p-2 rounded-xl bg-white/[0.02] border border-white/5">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1.5 text-purple-400">
                                                    <Zap size={10} className="fill-purple-400/20" />
                                                    <span className="text-[10px] font-black font-mono">{item.data.latency_ms}ms</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-accent mt-1">
                                                    <DollarSign size={10} className="fill-accent/20" />
                                                    <span className="text-[10px] font-black font-mono">${item.data.cost_usd.toFixed(4)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {!isAI && (
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${item.data.direction === 'inbound' ? 'bg-white/5 text-muted/60 border-white/10' : 'bg-accent/10 text-accent border-accent/20 shadow-[0_0_10px_rgba(46,255,161,0.1)]'}`}>
                                            {item.data.direction}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

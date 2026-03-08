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
            <div className="bg-bg-card rounded-[32px] border border-border overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-border/50 bg-bg-sidebar/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-accent" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Albert Live Pulse</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" /> msg
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> ai
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-border/20 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {items.map((item, idx) => {
                        const isAI = item.type === 'ai'
                        return (
                            <div key={idx} className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-all animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-105 shadow-lg ${isAI
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : item.data.direction === 'inbound'
                                            ? 'bg-bg-elevated text-muted border-border'
                                            : 'bg-accent/10 text-accent border-accent/20'
                                        }`}>
                                        {isAI ? <Brain size={20} /> : <MessageCircle size={20} />}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2.5">
                                            <p className="text-[12px] font-bold text-white/90">
                                                {isAI
                                                    ? <span className="flex items-center gap-1.5"><Cpu size={12} className="text-purple-400/50" /> {item.data.model.split('/')[1] || item.data.model}</span>
                                                    : item.data.direction === 'inbound' ? 'Customer Message' : 'Albert Response'
                                                }
                                            </p>
                                            <span className="text-[9px] font-mono text-muted/40 uppercase tracking-tighter shrink-0">
                                                • {new Date(item.data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-muted truncate mt-1.5 max-w-[350px] md:max-w-[700px] font-medium leading-relaxed">
                                            {isAI
                                                ? `Extracted signals for ${item.data.conversation_state} state (${item.data.prompt_tokens} + ${item.data.completion_tokens} tokens)`
                                                : item.data.content
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 shrink-0 ml-8">
                                    {isAI && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1 text-purple-400">
                                                    <Zap size={10} />
                                                    <span className="text-[10px] font-mono font-bold">{item.data.latency_ms}ms</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-accent mt-0.5">
                                                    <DollarSign size={10} />
                                                    <span className="text-[10px] font-mono font-bold">${item.data.cost_usd.toFixed(4)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {!isAI && (
                                        <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${item.data.direction === 'inbound' ? 'bg-white/5 text-muted' : 'bg-accent/10 text-accent'}`}>
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

import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Message, LLMSession } from '../../types'
import { Brain, MessageCircle } from 'lucide-react'

type FeedItem =
    | { type: 'message'; data: Message }
    | { type: 'ai'; data: LLMSession }

export const ActivityFeed: React.FC = () => {
    const [items, setItems] = useState<FeedItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchLatest = async () => {
        try {
            setIsLoading(true)
            // Fetch messages
            const { data: msgData } = await supabase
                .from('messages')
                .select('*, leads(first_name, last_name)')
                .order('created_at', { ascending: false })
                .limit(5)

            // Fetch AI Sessions
            const { data: aiData } = await supabase
                .from('llm_sessions')
                .select('*, leads(first_name, last_name)')
                .order('created_at', { ascending: false })
                .limit(5)

            const combined: FeedItem[] = [
                ...(msgData || []).map(m => ({ type: 'message' as const, data: m })),
                ...(aiData || []).map(a => ({ type: 'ai' as const, data: a }))
            ].sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime())

            setItems(combined)
        } catch (err) {
            console.error('Error fetching activity:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLatest()
        const channel = supabase.channel('activity-feed-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchLatest())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'llm_sessions' }, () => fetchLatest())
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    if (isLoading && items.length === 0) return <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
        ))}
    </div>

    return (
        <div className="bg-bg-card rounded-3xl border border-border divide-y divide-border/30 overflow-hidden shadow-sm">
            {items.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between group hover:bg-white/[0.01] transition-all">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 ${item.type === 'message'
                            ? item.data.direction === 'inbound'
                                ? 'bg-bg-elevated text-muted border-border'
                                : 'bg-accent/10 text-accent border-accent/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            }`}>
                            {item.type === 'message' ? <MessageCircle size={16} /> : <Brain size={16} />}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-[11px] font-bold text-white/90">
                                    {item.type === 'message'
                                        ? item.data.direction === 'inbound' ? 'Customer Message' : 'Albert Response'
                                        : `AI Thinking: ${item.data.model.split('/')[1] || item.data.model}`}
                                </p>
                                {item.type === 'ai' && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/10">
                                        {item.data.latency_ms}ms
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] text-muted truncate mt-1">
                                {item.type === 'message'
                                    ? item.data.content
                                    : `Processed ${item.data.total_tokens} tokens for ${item.data.conversation_state} state`}
                            </p>
                        </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                        <p className="text-[9px] font-mono text-muted uppercase tracking-tighter">
                            {new Date(item.data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {item.type === 'ai' && (
                            <p className="text-[9px] font-mono text-accent mt-0.5 tracking-tighter">
                                ${item.data.cost_usd.toFixed(4)}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

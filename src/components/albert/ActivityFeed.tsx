import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Message } from '../../types'
import { Activity } from 'lucide-react'

export const ActivityFeed: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchLatest = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*, leads(first_name, last_name)')
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) throw error
            setMessages(data || [])
        } catch (err) {
            console.error('Error fetching activity:', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLatest()
        const channel = supabase.channel('activity-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                fetchLatest()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    if (isLoading) return <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
        ))}
    </div>

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <Activity size={14} /> Live Activity Feed — Albert's last 10 messages
            </h2>
            <div className="bg-bg-card rounded-2xl border border-border divide-y divide-border/50 overflow-hidden">
                {messages.map((msg) => (
                    <div key={msg.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.01] transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] border ${msg.direction === 'inbound'
                                ? 'bg-bg-elevated text-muted border-border'
                                : 'bg-accent/10 text-accent border-accent/20 shadow-[0_0_8px_rgba(46,255,161,0.1)]'
                                }`}>
                                {msg.direction === 'inbound' ? (msg.leads?.first_name?.[0] || 'L') : 'A5'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold leading-none text-white/90">
                                    {msg.direction === 'inbound'
                                        ? <><span className="text-accent">{msg.leads?.first_name}</span> said:</>
                                        : <><span className="text-accent">Albert</span> replied:</>}
                                </p>
                                <p className="text-[11px] text-muted truncate mt-1.5 max-w-[500px]">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                        <span className="text-[9px] font-mono text-muted uppercase tracking-tighter shrink-0">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                {messages.length === 0 && (
                    <div className="p-12 text-center opacity-30 italic text-sm">
                        No activity yet.
                    </div>
                )}
            </div>
        </div>
    )
}

import React, { useEffect, useRef } from 'react'
import type { Lead, Message, ConversationState } from '../../types'
import { Badge } from '../ui/Badge'

interface ConversationViewProps {
    lead: Lead
    messages: Message[]
    state: ConversationState | null
}

export const ConversationView: React.FC<ConversationViewProps> = ({ lead, messages, state }) => {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Badge variant="state" value={state?.current_state || 'Opening'} label="State" />
                    <span className="text-[10px] text-muted font-mono uppercase tracking-[0.1em]">
                        {state?.message_count || 0} MESSAGES EXCHANGED
                    </span>
                </div>
                <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Live Dialogue</span>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar pb-10"
            >
                {messages.map((msg, i) => {
                    const isAlbert = msg.direction === 'outbound'
                    return (
                        <div key={msg.id || i} className={`flex ${isAlbert ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${isAlbert
                                    ? 'bg-accent text-bg-base font-medium rounded-tr-none'
                                    : 'bg-bg-elevated text-white border border-border rounded-tl-none'
                                }`}>
                                {msg.content}
                                <div className={`text-[9px] mt-2 font-mono uppercase tracking-tighter opacity-50 ${isAlbert ? 'text-bg-base' : 'text-muted'}`}>
                                    {isAlbert ? 'Albert' : lead.first_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-sm py-20">
                        No messages recorded yet.
                    </div>
                )}
            </div>

            <div className="pt-6 border-t border-border">
                <div className="bg-bg-sidebar/30 rounded-xl p-4 border border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Albert is handling this lead</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[10px] font-bold text-accent uppercase tracking-tighter">Autonomous Mode</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

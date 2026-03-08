import React, { useEffect, useRef } from 'react'
import type { Lead, Message, ConversationState } from '../../types'
import { Badge } from '../ui/Badge'
import { MessageSquare } from 'lucide-react'

interface ConversationViewProps {
    messages: Message[]
    isLoading?: boolean
    lead: Lead
    state: ConversationState | null
}

export const ConversationView: React.FC<ConversationViewProps> = ({
    messages,
    isLoading,
    lead,
    state
}) => {
    const leadName = lead.first_name || 'Lead'
    const currentState = state?.current_state || 'Opening'
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <div className="flex flex-col h-full animate-fade-up">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Badge variant="state" value={currentState as any} />
                    <span className="text-[11px] text-[#4B5668] font-mono font-medium uppercase tracking-[0.05em]">
                        {messages.length} MESSAGES
                    </span>
                </div>
                <div className="px-3 py-1 bg-[#2EFFA110] border border-[#2EFFA120] rounded-full">
                    <span className="text-[10px] font-bold text-[#2EFFA1] uppercase tracking-[0.1em]">Live Sync</span>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-4 space-y-5 custom-scrollbar pb-10"
            >
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}>
                            <div className="w-2/3 h-12 bg-[#1a2035] rounded-2xl border border-[#ffffff05]" />
                        </div>
                    ))
                ) : (
                    messages.map((msg, i) => {
                        const isAlbert = msg.direction === 'outbound'
                        return (
                            <div key={msg.id || i} className={`flex ${isAlbert ? 'justify-end' : 'justify-start'} animate-fade-up`} style={{ animationDelay: `${i * 20}ms` }}>
                                <div className={`max-w-[85%] px-5 py-4 rounded-[18px] text-[14px] leading-relaxed shadow-lg relative group ${isAlbert
                                    ? 'bg-[#2EFFA1] text-[#060912] font-medium rounded-tr-[4px]'
                                    : 'bg-[#1a2035] text-[#F0F4FF] border border-[#ffffff0a] rounded-tl-[4px]'
                                    }`}>
                                    {msg.content}
                                    <div className={`text-[9px] mt-2 font-mono font-bold uppercase tracking-tighter opacity-40 ${isAlbert ? 'text-[#060912]' : 'text-[#8892A4]'}`}>
                                        {isAlbert ? 'ALBERT INTEL' : leadName} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </div>
                                    {isAlbert && (
                                        <div className="absolute top-0 right-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[18px] pointer-events-none"></div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
                {!isLoading && messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center">
                        <MessageSquare size={32} className="mb-4 text-[#8892A4]" />
                        <p className="text-[13px] font-medium text-[#8892A4]">Begin dialogue monitoring</p>
                    </div>
                )}
            </div>

            {/* Status Footer */}
            <div className="pt-6 border-t border-[#ffffff0a]">
                <div className="bg-[#060912] rounded-xl px-4 py-3 border border-[#ffffff0a] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8892A4] opacity-50"></div>
                        <span className="text-[10px] text-[#4B5668] font-mono uppercase tracking-[0.1em]">Albert System Online</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#2EFFA10a] rounded-md border border-[#2EFFA120]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2EFFA1] live-pulse"></div>
                            <span className="text-[10px] font-bold text-[#2EFFA1] uppercase tracking-[0.1em]">Autonomous</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

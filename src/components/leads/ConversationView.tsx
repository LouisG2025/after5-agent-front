import React, { useEffect, useRef, useState } from 'react'
import type { Lead, Message, ConversationState } from '../../types'
import { Badge } from '../ui/Badge'
import { MessageSquare, Brain, CheckCircle, XCircle, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface ConversationViewProps {
    messages: Message[]
    isLoading?: boolean
    lead: Lead
    state: ConversationState | null
}

type ToastType = 'success' | 'error' | 'loading'
interface Toast {
    message: string
    type: ToastType
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
    const [toast, setToast] = useState<Toast | null>(null)
    const [isCollecting, setIsCollecting] = useState(false)
    const [activeFeedback, setActiveFeedback] = useState<string | null>(null)

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type })
        if (type !== 'loading') {
            setTimeout(() => setToast(null), 3500)
        }
    }

    // Write directly to Supabase training_data table — no backend needed
    const handleCollect = async () => {
        if (messages.length === 0) {
            showToast('No messages to collect', 'error')
            return
        }
        setIsCollecting(true)
        showToast('Collecting for training pool...', 'loading')
        try {
            const { error } = await supabase.from('training_data').insert({
                lead_id: lead.id,
                conversation_history: messages.map(m => ({
                    role: m.direction === 'outbound' ? 'assistant' : 'user',
                    content: m.content
                })),
                outcome: lead.outcome || 'In Progress',
                is_reviewed: false,
                source: 'manual',
                created_at: new Date().toISOString()
            })
            if (error) throw error
            showToast('Added to Training Pool ✓', 'success')
        } catch (error: any) {
            console.error('Collection failed:', error)
            showToast(error.message || 'Failed to collect', 'error')
        } finally {
            setIsCollecting(false)
        }
    }

    // Write feedback directly to Supabase — tag with immediate_feedback field
    const handleQuickFeedback = async (type: string) => {
        if (messages.length === 0) {
            showToast('No messages to evaluate', 'error')
            return
        }
        setActiveFeedback(type)
        showToast(`Synchronizing ${type} feedback...`, 'loading')
        try {
            const { error } = await supabase.from('training_data').insert({
                lead_id: lead.id,
                conversation_history: messages.map(m => ({
                    role: m.direction === 'outbound' ? 'assistant' : 'user',
                    content: m.content
                })),
                outcome: lead.outcome || 'In Progress',
                immediate_feedback: type,
                is_reviewed: true,
                source: 'quick_feedback',
                created_at: new Date().toISOString()
            })
            if (error) throw error
            showToast(`${type} feedback synchronized ✓`, 'success')
        } catch (error: any) {
            console.error('Feedback failed:', error)
            showToast(error.message || 'Failed to sync feedback', 'error')
        } finally {
            setActiveFeedback(null)
        }
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <div className="flex flex-col h-full animate-fade-up relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`absolute top-0 right-0 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-2xl animate-fade-up transition-all
                    ${toast.type === 'success' ? 'bg-[#06080f] border-accent/40 text-accent' :
                      toast.type === 'error'   ? 'bg-[#06080f] border-red-500/40 text-red-400' :
                                                 'bg-[#06080f] border-white/10 text-muted/60'}`}>
                    {toast.type === 'loading' && <Loader size={12} className="animate-spin" />}
                    {toast.type === 'success' && <CheckCircle size={12} />}
                    {toast.type === 'error'   && <XCircle size={12} />}
                    {toast.message}
                </div>
            )}

            <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-4">
                    <div className="scale-90 origin-left">
                        <Badge variant="state" value={currentState as any} />
                    </div>
                    <span className="text-[10px] text-muted/40 font-black uppercase tracking-[0.2em] italic">
                        {messages.length} Synchronized Packets
                    </span>
                </div>
                <button
                    onClick={handleCollect}
                    disabled={isCollecting}
                    className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl shadow-[0_0_15px_rgba(147,51,234,0.1)] hover:bg-purple-500/20 transition-all group disabled:opacity-40"
                >
                    {isCollecting
                        ? <Loader size={12} className="text-purple-400 animate-spin" />
                        : <Brain size={12} className="text-purple-400 group-hover:scale-110 transition-transform" />
                    }
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic">
                        {isCollecting ? 'Collecting...' : 'Collect for Training'}
                    </span>
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-6 space-y-6 custom-scrollbar pb-12"
            >
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse opacity-50`}>
                            <div className="w-2/3 h-16 bg-white/[0.03] rounded-3xl border border-white/5" />
                        </div>
                    ))
                ) : (
                    messages.map((msg, i) => {
                        const isAlbert = msg.direction === 'outbound'
                        return (
                            <div key={msg.id || i} className={`flex ${isAlbert ? 'justify-end' : 'justify-start'} animate-fade-up`} style={{ animationDelay: `${i * 30}ms` }}>
                                <div className={`max-w-[85%] px-6 py-5 rounded-[24px] text-[14px] leading-relaxed relative group transition-all duration-300 ${isAlbert
                                    ? 'bg-accent text-[#060912] font-black rounded-tr-[4px] shadow-[0_12px_24px_-8px_rgba(46,255,161,0.3)]'
                                    : 'bg-white/[0.03] text-[#F0F4FF] border border-white/5 rounded-tl-[4px] hover:bg-white/[0.05]'
                                    }`}>
                                    {msg.content}
                                    <div className={`text-[9px] mt-3 font-black uppercase tracking-[0.1em] italic opacity-40 flex items-center gap-2 ${isAlbert ? 'text-[#060912]' : 'text-muted'}`}>
                                        <span className="opacity-100">{isAlbert ? 'Neural Intel' : leadName}</span>
                                        <span className="w-1 h-1 rounded-full bg-current opacity-20"></span>
                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                {state?.is_typing && !isLoading && (
                    <div className="flex justify-end animate-fade-up">
                        <div className="bg-accent text-[#060912] px-6 py-5 rounded-[24px] rounded-tr-[4px] shadow-[0_12px_24px_-8px_rgba(46,255,161,0.3)] flex items-center gap-3">
                            <span className="text-[11px] font-black uppercase tracking-widest italic">Albert synthesizing</span>
                            <div className="flex gap-1.5 pt-0.5">
                                <div className="w-1.5 h-1.5 bg-[#060912] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-[#060912] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-[#060912] rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                {!isLoading && messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-20">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                            <MessageSquare size={32} className="text-muted" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] italic">Awaiting dialogue synchronization</p>
                    </div>
                )}
            </div>

            {/* Status Footer & Quick Feedback */}
            <div className="pt-8 border-t border-white/5 px-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] text-muted/30 font-black uppercase tracking-[0.3em] italic">Neural Flow Feedback</span>
                    <div className="flex gap-3">
                        {(['TONE', 'LOGIC', 'SALES'] as const).map((type, idx) => {
                            const colors = [
                                'text-amber-400/60 hover:text-amber-400 hover:bg-amber-400/5 hover:border-amber-400/20',
                                'text-blue-400/60 hover:text-blue-400 hover:bg-blue-400/5 hover:border-blue-400/20',
                                'text-accent/60 hover:text-accent hover:bg-accent/5 hover:border-accent/20'
                            ]
                            const isActive = activeFeedback === type
                            return (
                                <button
                                    key={type}
                                    onClick={() => handleQuickFeedback(type)}
                                    disabled={!!activeFeedback}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${colors[idx]}`}
                                >
                                    {isActive && <Loader size={8} className="animate-spin" />}
                                    {type}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-white/[0.02] rounded-2xl px-6 py-4 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted/40 shadow-[0_0_8px_rgba(255,255,255,0.1)]"></div>
                        <span className="text-[10px] text-muted/40 font-black uppercase tracking-[0.2em] italic">AI Logic Port Active</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5 px-3 py-1 bg-accent/5 rounded-lg border border-accent/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Autonomous Control</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

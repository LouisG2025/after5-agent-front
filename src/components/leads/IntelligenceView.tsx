import React, { useState } from 'react'
import type { Lead, ConversationState } from '../../types'
import { SignalScore } from '../ui/SignalScore'
import { SegmentedControl } from '../ui/SegmentedControl'
import { supabase } from '../../lib/supabase'

interface IntelligenceViewProps {
    lead: Lead
    state: ConversationState | null
    onUpdate: () => void
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
    lead,
    state,
    onUpdate
}) => {
    const [isSaving, setIsSaving] = useState(false)
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    const handleOverride = async (field: 'temperature' | 'outcome', value: string) => {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('leads')
                .update({ [field]: value })
                .eq('id', lead.id)

            if (error) throw error
            setNotification({ message: `Successfully updated to ${value}`, type: 'success' })
            onUpdate()
        } catch (err) {
            console.error('Error updating lead:', err)
            setNotification({ message: 'Failed to update lead', type: 'error' })
        } finally {
            setIsSaving(false)
            setTimeout(() => setNotification(null), 3000)
        }
    }

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Scoring & Controls */}
                <div className="space-y-10">
                    <section className="glass-card !border-white/5 p-10 !rounded-[40px] bg-white/[0.01] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full group-hover:bg-accent/10 transition-all duration-700"></div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted/40 italic">Neural Scoring Engine</h3>
                            <div className="scale-125 origin-right">
                                <SignalScore score={lead.signal_score} size="md" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div
                                    className="h-full bg-accent transition-all duration-1000 shadow-[0_0_15px_rgba(46,255,161,0.5)]"
                                    style={{ width: `${lead.signal_score * 10}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mt-4 italic">
                                <span className="text-muted/40">Confidence Probability</span>
                                <span className="text-accent">{lead.signal_score * 10}%</span>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-10">
                        <div className="space-y-6 px-2">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted/60 flex items-center gap-4 italic">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(46,255,161,0.5)]" /> Temperature Override
                            </h3>
                            <div className="glass-card !p-1.5 !rounded-2xl bg-white/[0.01] border-white/5">
                                <SegmentedControl
                                    options={['Cold', 'Warm', 'Hot']}
                                    activeId={lead.temperature}
                                    onChange={(val) => handleOverride('temperature', val)}
                                />
                            </div>
                        </div>
                        <div className="space-y-6 px-2">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted/60 flex items-center gap-4 italic">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" /> Disposition Control
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['In Progress', 'Not Interested', 'Disqualified', 'Meeting Booked'].map((opt, idx) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleOverride('outcome', opt)}
                                        disabled={isSaving}
                                        className={`px-5 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all duration-300 animate-fade-up ${lead.outcome === opt
                                                ? 'bg-accent/10 border-accent/40 text-accent shadow-[0_8px_16px_-4px_rgba(46,255,161,0.1)]'
                                                : 'bg-white/[0.01] border-white/5 text-muted/40 hover:border-white/20 hover:bg-white/[0.03] hover:text-white'
                                            }`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Signals & Facts */}
                <div className="space-y-10">
                    <section className="glass-card !border-white/5 p-10 !rounded-[40px] bg-white/[0.01] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 blur-[60px] rounded-full group-hover:bg-purple-500/10 transition-all duration-700"></div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted/40 mb-10 italic">BANT Signal Analysis</h3>
                        <div className="space-y-6">
                            {[
                                { k: 'Budget', v: state?.bant_budget, color: 'text-accent' },
                                { k: 'Authority', v: state?.bant_authority, color: 'text-purple-400' },
                                { k: 'Need', v: state?.bant_need, color: 'text-blue-400' },
                                { k: 'Timeline', v: state?.bant_timeline, color: 'text-amber-400' }
                            ].map((sig, idx) => (
                                <div key={sig.k} className="flex items-center justify-between group/sig animate-fade-up" style={{ animationDelay: `${idx * 60}ms` }}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1 h-1 rounded-full bg-white/20 group-hover/sig:bg-white/60 transition-colors`}></div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-muted/60 group-hover/sig:text-white transition-colors">{sig.k}</span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all duration-500 ${sig.v 
                                        ? `bg-white/[0.03] border-white/10 ${sig.color} shadow-inner` 
                                        : 'bg-white/[0.01] border-white/5 text-muted/10 italic'}`}>
                                        {sig.v || 'ANALYZING...'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-8 px-10 glass-card !rounded-[32px] !border-none bg-white/[0.01]/10 italic text-[13px] text-muted/40 italic leading-relaxed shadow-inner border border-white/5">
                        &quot;Neural processing detects strong intent alignment but price point friction remains. Albert is executing empathy-driven objection synthesis.&quot;
                    </section>
                </div>
            </div>

            {/* Status Notification */}
            {notification && (
                <div className={`fixed bottom-12 right-12 px-8 py-4 rounded-[24px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border animate-in slide-in-from-bottom-8 duration-500 z-[100] ${notification.type === 'success' ? 'bg-[#06080f] border-accent/40 text-accent' : 'bg-[#06080f] border-red-500/40 text-red-500'
                    }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-accent animate-pulse' : 'bg-red-500'}`}></div>
                        <p className="text-[11px] font-black uppercase tracking-widest italic">{notification.message}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

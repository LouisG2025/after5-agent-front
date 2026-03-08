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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Scoring & Controls */}
                <div className="space-y-8">
                    <section className="bg-bg-sidebar/30 p-8 rounded-3xl border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">AI Lead Scoring</h3>
                            <SignalScore score={lead.signal_score} size="md" />
                        </div>
                        <div className="space-y-1">
                            <div className="h-1 bg-border rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent transition-all duration-1000"
                                    style={{ width: `${lead.signal_score * 10}%` }}
                                />
                            </div>
                            <p className="text-[9px] text-muted font-mono mt-2 uppercase tracking-tighter">Confidence: {lead.signal_score * 10}%</p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                                <div className="w-1 h-3 bg-accent rounded-full" /> Temperature Override
                            </h3>
                            <SegmentedControl
                                options={['Cold', 'Warm', 'Hot']}
                                activeId={lead.temperature}
                                onChange={(val) => handleOverride('temperature', val)}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted flex items-center gap-2">
                                <div className="w-1 h-3 bg-accent rounded-full" /> Disposition Control
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['In Progress', 'Not Interested', 'Disqualified', 'Meeting Booked'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => handleOverride('outcome', opt)}
                                        disabled={isSaving}
                                        className={`px-3 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all ${lead.outcome === opt
                                                ? 'bg-accent/10 border-accent/40 text-accent'
                                                : 'bg-white/5 border-border text-muted hover:border-white/20'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Signals & Facts */}
                <div className="space-y-8">
                    <section className="bg-bg-card p-8 rounded-3xl border border-border space-y-6">
                        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">BANT Signal Analysis</h3>
                        <div className="space-y-4">
                            {[
                                { k: 'Budget', v: state?.bant_budget },
                                { k: 'Authority', v: state?.bant_authority },
                                { k: 'Need', v: state?.bant_need },
                                { k: 'Timeline', v: state?.bant_timeline }
                            ].map(sig => (
                                <div key={sig.k} className="flex items-start justify-between group">
                                    <span className="text-xs font-medium text-muted">{sig.k}</span>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-mono ${sig.v ? 'bg-accent/10 text-accent' : 'bg-white/5 text-muted/30'}`}>
                                        {sig.v || 'UNKNOWN'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-1 px-4 bg-bg-sidebar/50 border border-border rounded-2xl italic text-xs text-muted/60 py-4 leading-relaxed">
                        &quot;Lead expresses interest in automation but seems hesitant about pricing during discovery. Albert is currently maintaining a supportive tone.&quot;
                    </section>
                </div>
            </div>

            {/* Status Notification */}
            {notification && (
                <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-4 duration-300 z-50 ${notification.type === 'success' ? 'bg-accent/10 border-accent/40 text-accent' : 'bg-red-500/10 border-red-500/40 text-red-500'
                    }`}>
                    <p className="text-xs font-bold uppercase tracking-wider">{notification.message}</p>
                </div>
            )}
        </div>
    )
}

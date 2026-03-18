import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StatCard } from '../components/ui/StatCard'
import { Brain, FileText, Download, Save, Trash2, Plus, Sparkles } from 'lucide-react'

const Training: React.FC = () => {
    const [examples, setExamples] = useState<any[]>([])
    const [worthyPool, setWorthyPool] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'library' | 'pool'>('library')
    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [reviewItem, setReviewItem] = useState<any | null>(null)
    const [manualScore, setManualScore] = useState<number>(0)
    const [feedback, setFeedback] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newExampleTitle, setNewExampleTitle] = useState("")
    const [newExampleJSON, setNewExampleJSON] = useState("")

    const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/training" 

    useEffect(() => {
        fetchData()

        // Real-time subscription for the training pool
        const channel = supabase
            .channel('training-pool-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'training_data'
                },
                () => {
                    // Update data when any change happens in training_data
                    fetchData()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])


    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [libRes, poolRes] = await Promise.all([
                fetch(`${API_BASE}/library`),
                supabase.from('training_data').select('*, leads(first_name, last_name)').order('created_at', { ascending: false })
            ])
            
            const libData = await libRes.json()
            if (libData.status === 'ok') setExamples(libData.examples)
            if (poolRes.data) setWorthyPool(poolRes.data)
        } catch (error) {
            console.error("Error fetching training data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            await fetch(`${API_BASE}/export`, { method: 'POST' })
            alert("Export started in background!")
        } catch (error) {
            alert("Export failed")
        }
    }

    const handleAddExample = async () => {
        try {
            const parsed = JSON.parse(newExampleJSON)
            const res = await fetch(`${API_BASE}/library`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: newExampleTitle,
                    ...parsed
                })
            })
            if (res.ok) {
                setIsAddOpen(false)
                setNewExampleTitle("")
                setNewExampleJSON("")
                fetchData()
            }
        } catch (error) {
            alert("Invalid JSON or server error")
        }
    }

    const handleSaveReview = async () => {
        if (!reviewItem) return
        try {
            await fetch(`${API_BASE}/worthy/${reviewItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    manual_score: manualScore,
                    feedback: feedback,
                    is_reviewed: true
                })
            })
            setIsReviewOpen(false)
            fetchData()
        } catch (error) {
            alert("Failed to save review")
        }
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Albert Training & RAG</h1>
                    <p className="text-muted mt-2">Manage the conversation library and fine-tuning data pool.</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-bg-base font-bold rounded-2xl hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(46,255,161,0.2)]"
                >
                    <Download size={18} /> Export for Fine-Tuning
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Library Examples" value={examples.length} icon={FileText} accentColor="text-blue-400" />
                <StatCard label="Training Pool Size" value={worthyPool.length} icon={Brain} accentColor="text-purple-400" />
                <StatCard label="Success Leads" value={worthyPool.filter(p => p.outcome === 'booked').length} icon={Sparkles} accentColor="text-accent" />
            </div>

            <div className="bg-bg-card rounded-[32px] border border-border overflow-hidden shadow-2xl">
                <div className="flex border-b border-border">
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`px-8 py-5 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'library' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-muted hover:text-white'}`}
                    >
                        Conversation Library
                    </button>
                    <button 
                        onClick={() => setActiveTab('pool')}
                        className={`px-8 py-5 text-sm font-bold tracking-widest uppercase transition-all ${activeTab === 'pool' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-muted hover:text-white'}`}
                    >
                        Training Pool (Worthy)
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-muted font-mono text-xs uppercase tracking-widest">Loading Training Data...</p>
                        </div>
                    ) : activeTab === 'library' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button 
                                onClick={() => setIsAddOpen(true)}
                                className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border hover:border-accent/40 hover:bg-accent/5 transition-all group text-left w-full h-full"
                            >
                                <Plus className="text-muted group-hover:text-accent mb-2" size={32} />
                                <span className="text-sm font-bold text-muted group-hover:text-white">Add New Example</span>
                            </button>
                            {examples.map((ex, i) => (
                                <div key={i} className="p-6 bg-bg-base/50 rounded-2xl border border-border hover:border-accent/20 transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-blue-400/10 rounded-lg text-blue-400">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-white mb-2">{ex.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(ex.tags || {}).map(([k, v]: [string, any]) => (
                                            <span key={k} className="text-[10px] px-2 py-0.5 bg-white/5 text-muted rounded-md border border-border/50 uppercase font-mono">
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-mono text-muted uppercase tracking-widest border-b border-border">
                                        <th className="pb-4 px-4">Lead</th>
                                        <th className="pb-4 px-4">Score</th>
                                        <th className="pb-4 px-4">Outcome</th>
                                        <th className="pb-4 px-4">Feedback</th>
                                        <th className="pb-4 px-4">Date</th>
                                        <th className="pb-4 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {worthyPool.map((p, i) => (
                                        <tr key={i} className="group hover:bg-white/[0.02]">
                                            <td className="py-4 px-4 font-bold text-white">
                                                {p.leads?.first_name} {p.leads?.last_name}
                                                {p.is_reviewed && <span className="ml-2 text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded uppercase tracking-tighter">Reviewed</span>}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <span className={`font-mono font-bold ${p.score > 85 ? 'text-accent' : 'text-amber-400'}`}>
                                                        {p.score} (Auto)
                                                    </span>
                                                    {p.manual_score && <span className="text-[10px] text-purple-400 font-mono">Manual: {p.manual_score}</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-[10px] px-2 py-0.5 bg-white/5 text-muted rounded-md border border-border/50 uppercase font-mono">
                                                    {p.outcome}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-xs text-muted max-w-[200px] truncate italic">
                                                    {p.feedback || "No feedback yet"}
                                                </p>
                                            </td>
                                            <td className="py-4 px-4 text-xs text-muted">
                                                {new Date(p.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button 
                                                    onClick={() => {
                                                        setReviewItem(p)
                                                        setManualScore(p.manual_score || p.score)
                                                        setFeedback(p.feedback || "")
                                                        setIsReviewOpen(true)
                                                    }}
                                                    className="text-muted hover:text-white transition-all px-3 py-1 bg-white/5 rounded-lg border border-border/50 hover:border-accent/40"
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {isReviewOpen && reviewItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Review Conversation: {reviewItem.leads?.first_name}</h2>
                            <button onClick={() => setIsReviewOpen(false)} className="text-muted hover:text-white text-2xl">&times;</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg-base/30 custom-scrollbar">
                            {reviewItem.history?.map((msg: any, idx: number) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-accent/10 text-white' : 'bg-bg-card border border-border text-muted'}`}>
                                        <p className="whitespace-pre-wrap">{msg.content.replaceAll('|||', '\n')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 border-t border-border bg-bg-elevated/50 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-xs font-mono uppercase tracking-[0.2em] text-muted">Manual Score (0-100)</label>
                                <input 
                                    type="number" 
                                    value={manualScore} 
                                    onChange={(e) => setManualScore(Number(e.target.value))}
                                    className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-white focus:border-accent/40 outline-none"
                                />
                                <p className="text-[10px] text-muted">Albert marked this as <strong>{reviewItem.score}</strong>. Update it if you disagree.</p>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-mono uppercase tracking-[0.2em] text-muted">Feedback & Notes</label>
                                <textarea 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="What did Albert miss?"
                                    className="w-full h-24 bg-bg-base border border-border rounded-xl px-4 py-3 text-white focus:border-accent/40 outline-none resize-none"
                                />
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: "Tone 🎭", text: "Tone correction needed: " },
                                        { label: "Chunking ✂️", text: "Chunking issue: " },
                                        { label: "Objections 🛡️", text: "Objection handling improvement: " },
                                        { label: "Sales 💰", text: "Sales technique error: " }
                                    ].map(btn => (
                                        <button 
                                            key={btn.label}
                                            onClick={() => setFeedback(prev => prev ? `${prev}\n${btn.text}` : btn.text)}
                                            className="text-[9px] px-2 py-1 bg-white/5 border border-border rounded-lg hover:bg-accent/10 hover:border-accent/20 text-muted hover:text-accent transition-all uppercase font-mono tracking-tighter"
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border flex justify-between gap-4 bg-bg-elevated">
                            <button 
                                onClick={() => {
                                    setNewExampleTitle(`Leads - ${reviewItem.leads?.first_name}`)
                                    setNewExampleJSON(JSON.stringify({
                                        tags: { outcome: reviewItem.outcome, lead: reviewItem.leads?.first_name },
                                        history: reviewItem.history
                                    }, null, 2))
                                    setIsReviewOpen(false)
                                    setIsAddOpen(true)
                                }}
                                className="px-4 py-2 border border-accent/20 text-accent hover:bg-accent/5 rounded-xl text-xs font-bold transition-all"
                            >
                                🚀 Promote to RAG Library
                            </button>
                            <div className="flex gap-4">
                                <button onClick={() => setIsReviewOpen(false)} className="px-6 py-2 text-muted hover:text-white">Cancel</button>
                                <button onClick={handleSaveReview} className="px-8 py-2 bg-accent text-bg-base font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(46,255,161,0.2)]">
                                    <Save size={16} /> Save Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Example Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-bg-card border border-border w-full max-w-2xl rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Add New Conversation Example</h2>
                            <button onClick={() => setIsAddOpen(false)} className="text-muted hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-muted">Example Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Objections - Pricing"
                                    value={newExampleTitle}
                                    onChange={(e) => setNewExampleTitle(e.target.value)}
                                    className="w-full bg-bg-base border border-border rounded-xl px-4 py-3 text-white focus:border-accent/40 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase tracking-widest text-muted">JSON Content (History Array)</label>
                                <textarea 
                                    placeholder='{"tags": {"industry": "real-estate"}, "history": [...]}'
                                    value={newExampleJSON}
                                    onChange={(e) => setNewExampleJSON(e.target.value)}
                                    className="w-full h-64 bg-bg-base border border-border rounded-xl px-4 py-3 text-white font-mono text-xs focus:border-accent/40 outline-none resize-none"
                                />
                                <p className="text-[10px] text-muted italic">Paste the history JSON array including tags here.</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-4 bg-bg-elevated">
                            <button onClick={() => setIsAddOpen(false)} className="px-6 py-2 text-muted hover:text-white">Cancel</button>
                            <button 
                                onClick={handleAddExample}
                                className="px-8 py-2 bg-accent text-bg-base font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(46,255,161,0.2)]"
                            >
                                <Save size={16} /> Save Example
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Training

import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Brain, FileText, Download, Save, Trash2, Plus, Sparkles, X } from 'lucide-react'

const Training: React.FC = () => {
    const [examples, setExamples] = useState<any[]>([])
    const [worthyPool, setWorthyPool] = useState<any[]>([])
    const [brainRules, setBrainRules] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'library' | 'pool' | 'brain'>('library')
    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [reviewItem, setReviewItem] = useState<any | null>(null)
    const [manualScore, setManualScore] = useState<number>(0)
    const [feedback, setFeedback] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newExampleTitle, setNewExampleTitle] = useState("")
    const [newExampleJSON, setNewExampleJSON] = useState("")

    // Brain Rule Form State
    const [isBrainAddOpen, setIsBrainAddOpen] = useState(false)
    const [brainForm, setBrainForm] = useState({
        category: 'sales',
        scenario: '',
        ideal_response: '',
        trigger_keywords: [] as string[],
        priority: 1
    })

    const isProd = import.meta.env.PROD || window.location.hostname !== 'localhost'
    const defaultApiUrl = isProd ? 'https://after5-agent-production.up.railway.app' : 'http://localhost:8000'
    const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl
    const API_BASE = `${apiUrl}/training`

    useEffect(() => {
        fetchData()

        const channel = supabase
            .channel('training-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'training_data' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'dynamic_training' }, () => fetchData())
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])


    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [libRes, brainRes, poolRes] = await Promise.all([
                fetch(`${API_BASE}/library`),
                fetch(`${API_BASE}/brain`),
                supabase.from('training_data').select('*, leads(first_name, last_name)').order('created_at', { ascending: false })
            ])
            
            const libData = await libRes.json()
            const brainData = await brainRes.json()

            if (libData.status === 'ok') setExamples(libData.examples)
            if (brainData.status === 'ok') setBrainRules(brainData.data)
            if (poolRes.data) setWorthyPool(poolRes.data)
        } catch (error) {
            console.error("Error fetching training data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteExample = async (filename: string) => {
        if (!confirm("Delete this pattern from Success Library?")) return
        try {
            await fetch(`${API_BASE}/library/${filename}`, { method: 'DELETE' })
            fetchData()
        } catch (error) {
            alert("Delete failed")
        }
    }

    const handleDeleteBrainRule = async (id: number) => {
        if (!confirm("Remove this rule from Albert's Active Brain?")) return
        try {
            await fetch(`${API_BASE}/brain/${id}`, { method: 'DELETE' })
            fetchData()
        } catch (error) {
            alert("Delete failed")
        }
    }

    const handleAddBrainRule = async () => {
        try {
            const res = await fetch(`${API_BASE}/brain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...brainForm,
                    is_active: true
                })
            })
            if (res.ok) {
                setIsBrainAddOpen(false)
                setBrainForm({ category: 'sales', scenario: '', ideal_response: '', trigger_keywords: [], priority: 1 })
                fetchData()
            }
        } catch (error) {
            alert("Failed to inject into neural brain")
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
        <div className="p-10 space-y-10 animate-fade-up max-w-[1600px] mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
                        Albert <span className="text-gradient">Intelligence</span>
                    </h1>
                    <p className="text-[11px] text-muted/40 mt-4 font-black uppercase tracking-[0.3em] italic">Neural Pattern Refinement Hub</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleExport}
                        className="btn-premium flex items-center gap-3 !px-8 !py-4 group shadow-[0_20px_40px_-12px_rgba(46,255,161,0.2)]"
                    >
                        <Download size={20} className="group-hover:-translate-y-1 transition-transform" /> 
                        <span className="font-black italic">FINE-TUNING EXPORT</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card !border-white/5 p-8 flex items-center gap-6 hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-all duration-700"></div>
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 shadow-lg transition-all">
                        <FileText size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] italic">Library Examples</p>
                        <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{examples.length}</h3>
                    </div>
                </div>
                <div className="glass-card !border-white/5 p-8 flex items-center gap-6 hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full group-hover:bg-purple-500/10 transition-all duration-700"></div>
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 shadow-lg transition-all">
                        <Brain size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] italic">Training Pool</p>
                        <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{worthyPool.length}</h3>
                    </div>
                </div>
                <div className="glass-card !border-white/5 p-8 flex items-center gap-6 hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-3xl rounded-full group-hover:bg-accent/10 transition-all duration-700"></div>
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 shadow-lg transition-all">
                        <Sparkles size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] italic">Success Conversion</p>
                        <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{worthyPool.filter(p => p.outcome === 'booked').length}</h3>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden !rounded-[48px] border-white/5 shadow-2xl bg-[#090b14]/20 border border-white/5">
                <div className="flex border-b border-white/5 bg-white/[0.01] p-2 gap-2">
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`flex-1 px-8 py-5 text-[11px] font-black tracking-[0.2em] uppercase transition-all rounded-[28px] ${activeTab === 'library' ? 'bg-accent/10 text-accent shadow-inner' : 'text-muted/40 hover:text-white hover:bg-white/5'}`}
                    >
                        Success Library
                    </button>
                    <button 
                        onClick={() => setActiveTab('pool')}
                        className={`flex-1 px-8 py-5 text-[11px] font-black tracking-[0.2em] uppercase transition-all rounded-[28px] ${activeTab === 'pool' ? 'bg-accent/10 text-accent shadow-inner' : 'text-muted/40 hover:text-white hover:bg-white/5'}`}
                    >
                        Real-time Pool
                    </button>
                    <button 
                        onClick={() => setActiveTab('brain')}
                        className={`flex-1 px-8 py-5 text-[11px] font-black tracking-[0.2em] uppercase transition-all rounded-[28px] ${activeTab === 'brain' ? 'bg-[#9333ea]/10 text-purple-400 shadow-inner' : 'text-muted/40 hover:text-white hover:bg-white/5'}`}
                    >
                        Neural Brain
                    </button>
                </div>

                <div className="p-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-accent/20 blur-[40px] rounded-full scale-150 animate-pulse"></div>
                                <div className="w-16 h-16 border-4 border-accent/10 border-t-accent rounded-full animate-spin relative z-10"></div>
                            </div>
                            <p className="text-accent/40 font-black text-[11px] uppercase tracking-[0.4em] animate-pulse italic">Synchronizing Neural Pathing...</p>
                        </div>
                    ) : activeTab === 'library' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <button 
                                onClick={() => setIsAddOpen(true)}
                                className="flex flex-col items-center justify-center p-12 glass-card !border-dashed border-white/10 hover:border-accent/40 hover:bg-accent/[0.02] transition-all group min-h-[220px] shadow-inner"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent/10 border border-white/5 group-hover:border-accent/20 transition-all duration-500 mb-6 group-hover:scale-110">
                                    <Plus className="text-muted/40 group-hover:text-accent transition-colors" size={32} />
                                </div>
                                <span className="text-[11px] font-black text-muted/40 group-hover:text-white tracking-[0.2em] uppercase italic transition-colors">Inject New Pattern</span>
                            </button>
                            {examples.map((ex, i) => (
                                <div key={i} className="p-8 glass-card !border-white/5 hover:bg-white/[0.04] transition-all group relative overflow-hidden shadow-lg animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <button onClick={() => handleDeleteExample(ex.filename)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500/40 hover:text-red-500 border border-red-500/10 hover:border-red-500/40 transition-all flex items-center justify-center">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-12 h-12 bg-blue-400/10 border border-blue-400/20 rounded-2xl text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                            <FileText size={24} />
                                        </div>
                                        <h3 className="font-black text-white tracking-tight text-lg italic uppercase">{ex.title}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {Object.entries(ex.tags || {}).map(([k, v]: [string, any]) => (
                                            <span key={k} className="text-[10px] font-black px-3.5 py-1.5 bg-white/[0.03] text-muted/60 hover:text-white rounded-xl border border-white/5 uppercase tracking-widest transition-all hover:bg-white/[0.06] italic">
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activeTab === 'brain' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <button 
                                onClick={() => setIsBrainAddOpen(true)}
                                className="flex flex-col items-center justify-center p-12 glass-card !border-dashed border-purple-500/20 hover:border-purple-400 hover:bg-purple-500/[0.02] transition-all group min-h-[280px] shadow-inner lg:col-span-2"
                            >
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 border border-white/5 group-hover:border-purple-500/20 transition-all duration-500 mb-6 group-hover:scale-110 shadow-2xl">
                                    <Plus className="text-muted/40 group-hover:text-purple-400 transition-colors" size={40} />
                                </div>
                                <span className="text-[13px] font-black text-muted/40 group-hover:text-white tracking-[0.4em] uppercase italic transition-colors">Forge New Cognitive Link</span>
                                <p className="text-[10px] text-muted/20 uppercase tracking-widest mt-4 font-black">Directly augment Albert's system logic</p>
                            </button>
                            {brainRules.map((rule, i) => (
                                <div key={i} className="p-10 glass-card !border-white/5 hover:bg-white/[0.04] transition-all group relative overflow-hidden shadow-2xl animate-fade-up">
                                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleDeleteBrainRule(rule.id)} className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500/40 hover:text-red-500 border border-red-500/10 hover:border-red-500/40 transition-all flex items-center justify-center">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-6 mb-10">
                                        <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Brain size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white tracking-tighter text-xl italic uppercase underline decoration-purple-500/20 underline-offset-4">{rule.category} : {rule.subcategory || "Pattern"}</h3>
                                            <div className="flex gap-2 mt-2">
                                                {rule.trigger_keywords?.map((k: string) => (
                                                    <span key={k} className="text-[8px] font-black px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/10 uppercase tracking-widest">#{k}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="glass-card !bg-black/40 !rounded-2xl p-6 border-white/5">
                                            <p className="text-[9px] text-muted/30 font-black uppercase tracking-[0.3em] mb-3 italic">Detected Scenario</p>
                                            <p className="text-[13px] text-white/80 font-bold leading-relaxed">"{rule.scenario}"</p>
                                        </div>
                                        <div className="glass-card !bg-accent/5 !rounded-2xl p-6 border-accent/10">
                                            <p className="text-[9px] text-accent/40 font-black uppercase tracking-[0.3em] mb-3 italic">Mapped Response Path</p>
                                            <p className="text-[13px] text-accent font-black leading-relaxed italic">"{rule.ideal_response}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-2 custom-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-[10px] font-black text-muted/30 uppercase tracking-[0.3em] italic">
                                        <th className="pb-6 px-10">Subject Identity</th>
                                        <th className="pb-6 px-10">Neural Accuracy</th>
                                        <th className="pb-6 px-10">Disposition</th>
                                        <th className="pb-6 px-10">System Commentary</th>
                                        <th className="pb-6 px-10">Timestamp</th>
                                        <th className="pb-6 px-10 text-right">Protocol</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {worthyPool.map((p, i) => (
                                        <tr key={i} className="group animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                                            <td className="py-6 px-10 first:rounded-l-[32px] bg-white/[0.01] border-y border-l border-white/5 group-hover:bg-white/[0.03] transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[12px] font-black text-white shadow-inner group-hover:scale-110 transition-transform">
                                                        {(p.leads?.first_name?.[0] || 'U')}
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-[15px] text-white italic uppercase tracking-tight">
                                                            {p.leads?.first_name} {p.leads?.last_name || ""}
                                                        </span>
                                                        {p.is_reviewed && (
                                                            <div className="mt-1 py-0.5 px-2 bg-accent/20 text-accent text-[8px] font-black rounded-lg uppercase tracking-widest w-fit border border-accent/20">
                                                                Validated
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-10 bg-white/[0.01] border-y border-white/5 group-hover:bg-white/[0.03] transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-32 h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                        <div 
                                                            className={`h-full transition-all duration-1000 shadow-[0_0_10px_currentColor] ${p.score > 85 ? 'bg-accent' : 'bg-amber-400'}`}
                                                            style={{ width: `${p.score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`font-black text-xs italic ${p.score > 85 ? 'text-accent' : 'text-amber-400'}`}>
                                                        {p.score}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-10 bg-white/[0.01] border-y border-white/5 group-hover:bg-white/[0.03] transition-all">
                                                <span className={`px-4 py-2 rounded-xl border text-[10px] font-black tracking-widest uppercase italic transition-all ${p.outcome === 'booked' ? 'border-accent/40 text-accent bg-accent/10 shadow-[0_0_15px_rgba(46,255,161,0.1)]' : 'border-white/10 bg-white/5 text-muted/40'}`}>
                                                    {p.outcome}
                                                </span>
                                            </td>
                                            <td className="py-6 px-10 bg-white/[0.01] border-y border-white/5 group-hover:bg-white/[0.03] transition-all">
                                                <p className="text-[11px] text-muted/40 max-w-[220px] truncate italic font-black uppercase tracking-widest">
                                                    {p.feedback || "Awaiting Human Audit"}
                                                </p>
                                            </td>
                                            <td className="py-6 px-10 bg-white/[0.01] border-y border-white/5 group-hover:bg-white/[0.03] transition-all text-[11px] text-muted/40 font-black italic tracking-widest">
                                                {new Date(p.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-6 px-10 text-right last:rounded-r-[32px] bg-white/[0.01] border-y border-r border-white/5 group-hover:bg-white/[0.03] transition-all">
                                                <button 
                                                    onClick={() => {
                                                        setReviewItem(p)
                                                        setManualScore(p.manual_score || p.score)
                                                        setFeedback(p.feedback || "")
                                                        setIsReviewOpen(true)
                                                    }}
                                                    className="btn-secondary !text-[11px] !font-black !uppercase !tracking-widest !px-6 !py-3 hover:!text-accent hover:!border-accent/40 !rounded-xl shadow-lg hover:shadow-accent/5 transition-all"
                                                >
                                                    AUDIT LOGS
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#06080f]/80 backdrop-blur-3xl animate-fade-up">
                    <div className="glass-card !border-white/10 w-full max-w-6xl max-h-[95vh] !rounded-[64px] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10">
                        <div className="p-12 border-b border-white/5 flex items-center justify-between bg-white/[0.01] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full"></div>
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="w-20 h-20 rounded-[32px] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-2xl group shadow-accent/5">
                                    <Brain size={40} className="group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase underline decoration-accent/20 underline-offset-8">Neural Context Audit</h2>
                                    <div className="flex items-center gap-4 mt-4">
                                        <p className="text-[11px] text-accent font-black uppercase tracking-[0.3em] bg-accent/5 px-3 py-1 rounded-lg border border-accent/10">Session: {reviewItem.id.slice(0,12)}</p>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                        <p className="text-[11px] text-muted/40 font-black uppercase tracking-[0.3em] italic">Cognitive Reconstruction Mode</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsReviewOpen(false)} className="w-16 h-16 rounded-[24px] hover:bg-white/10 flex items-center justify-center text-muted/40 hover:text-white transition-all border border-transparent hover:border-white/10 active:scale-95 group">
                                <X size={32} className="group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-12 space-y-8 bg-[#090b14]/40 custom-scrollbar shadow-inner">
                            {reviewItem.history?.map((msg: any, idx: number) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`} style={{ animationDelay: `${idx * 40}ms` }}>
                                    <div className={`max-w-[80%] px-8 py-6 rounded-[32px] text-sm leading-relaxed shadow-2xl relative group transition-all duration-300 ${msg.role === 'user' 
                                        ? 'bg-accent text-[#060912] font-black rounded-tr-none shadow-[0_20px_40px_-10px_rgba(46,255,161,0.2)]' 
                                        : 'bg-white/[0.02] text-[#F0F4FF] border border-white/10 rounded-tl-none hover:bg-white/[0.04]'}`}>
                                        <p className="whitespace-pre-wrap tracking-wide">{msg.content.replaceAll('|||', '\n')}</p>
                                        <div className={`text-[10px] mt-4 font-black uppercase tracking-[0.2em] italic flex items-center gap-3 ${msg.role === 'user' ? 'text-[#060912]/60' : 'text-muted/40'}`}>
                                            <span className="opacity-100">{msg.role === 'user' ? 'Direct Source' : 'Neural Agent'}</span>
                                            <div className="w-1 h-1 rounded-full bg-current opacity-20"></div>
                                            <span>TELEMETRY_RECORD_0{idx}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-12 border-t border-white/5 bg-white/[0.01] grid grid-cols-1 md:grid-cols-2 gap-16 shadow-2xl relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/5 hidden md:block"></div>
                            <div className="space-y-8">
                                <div className="flex items-end justify-between mb-2">
                                    <div>
                                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-accent italic">Calibrate Accuracy</label>
                                        <p className="text-[10px] text-muted/40 font-black uppercase tracking-widest mt-1">Manual Weight Adjustment</p>
                                    </div>
                                    <span className="text-4xl font-black text-accent font-mono italic tracking-tighter">{manualScore}%</span>
                                </div>
                                <div className="relative pt-4 pb-8">
                                    <input 
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={manualScore} 
                                        onChange={(e) => setManualScore(Number(e.target.value))}
                                        className="w-full accent-accent bg-white/5 h-3 rounded-full cursor-pointer hover:accent-accent/80 transition-all appearance-none border border-white/5"
                                    />
                                    <div className="flex justify-between text-[10px] text-muted/20 font-black uppercase tracking-[0.3em] mt-6 italic">
                                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/20"></div>SUB-OPTIMAL</span>
                                        <span className="flex items-center gap-2">NOMINAL STATUS<div className="w-1.5 h-1.5 rounded-full bg-accent/20"></div></span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-[0.3em] text-purple-400 italic">Expert Neural Feedback</label>
                                    <p className="text-[10px] text-muted/40 font-black uppercase tracking-widest mt-1">Direct Pattern Guidance</p>
                                </div>
                                <div className="relative group">
                                    <textarea 
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Enter instructions for neural pattern adaptation..."
                                        className="input-modern w-full h-40 !rounded-[32px] !p-8 !bg-white/[0.02] border-white/5 focus:border-purple-500/40 focus:ring-purple-500/10 !text-[13px] font-bold tracking-tight resize-none shadow-inner"
                                    />
                                    <div className="absolute right-6 bottom-6 flex gap-3">
                                        {[
                                            { label: "TONE", text: "Tone: ", color: "hover:text-amber-400" },
                                            { label: "LOGIC", text: "Logic: ", color: "hover:text-blue-400" },
                                            { label: "SALES", text: "Sales: ", color: "hover:text-accent" }
                                        ].map(btn => (
                                            <button 
                                                key={btn.label}
                                                onClick={() => setFeedback(prev => prev ? `${prev}\n${btn.text}` : btn.text)}
                                                className={`text-[9px] font-black px-4 py-2 glass-card !rounded-xl !border-white/5 !bg-white/5 transition-all uppercase tracking-widest ${btn.color} hover:bg-white/10`}
                                            >
                                                {btn.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/[0.02] relative z-10">
                            <button 
                                onClick={() => {
                                    setBrainForm({
                                        category: 'success',
                                        scenario: reviewItem.history.find((m:any) => m.role === 'user')?.content || 'Customer Inquiry',
                                        ideal_response: reviewItem.history.find((m:any) => m.role === 'assistant')?.content || '',
                                        trigger_keywords: [],
                                        priority: 2
                                    })
                                    setIsReviewOpen(false)
                                    setIsBrainAddOpen(true)
                                }}
                                className="group flex items-center gap-6"
                            >
                                <div className="w-16 h-16 rounded-[24px] bg-purple-500/5 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/10 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                                    <Sparkles size={28} className="animate-pulse" />
                                </div>
                                <div className="text-left">
                                    <span className="text-[13px] font-black uppercase tracking-widest text-white italic group-hover:text-purple-400 transition-colors">WELD TO NEURAL CORE</span>
                                    <p className="text-[10px] text-muted/40 font-black uppercase tracking-[0.2em] mt-1 italic">Make this specific performance a permanent rule</p>
                                </div>
                            </button>
                            <div className="flex gap-6">
                                <button onClick={() => setIsReviewOpen(false)} className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-muted/20 hover:text-white transition-all italic">ABORT</button>
                                <button onClick={handleSaveReview} className="btn-premium flex items-center gap-4 !rounded-[28px] !px-12 !py-5 shadow-[0_25px_50px_-12px_rgba(46,255,161,0.3)]">
                                    <Save size={24} /> 
                                    <span className="text-[13px] font-black italic">COMMIT CHANGES</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Brain Injection Modal */}
            {isBrainAddOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-[#06080f]/95 backdrop-blur-3xl animate-fade-up">
                    <div className="glass-card !border-white/10 w-full max-w-4xl !rounded-[56px] overflow-hidden flex flex-col shadow-[0_0_120px_rgba(46,255,161,0.1)] border border-white/10">
                        <div className="p-12 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase underline decoration-purple-500/20 underline-offset-8">Cognitive Link Forge</h2>
                                <p className="text-[11px] text-purple-400 font-black uppercase tracking-[0.4em] mt-2 italic flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                    Direct Neural Augmentation
                                </p>
                            </div>
                            <button onClick={() => setIsBrainAddOpen(false)} className="w-14 h-14 rounded-2xl hover:bg-white/10 flex items-center justify-center text-muted/40 hover:text-white transition-all border border-transparent hover:border-white/10 active:scale-95">
                                <X size={28} />
                            </button>
                        </div>
                        <div className="p-12 space-y-10 bg-[#090b14]/40 custom-scrollbar pr-10 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted/30 ml-2 italic">Neural Classification</label>
                                    <select 
                                        value={brainForm.category}
                                        onChange={(e) => setBrainForm({...brainForm, category: e.target.value})}
                                        className="input-modern w-full !rounded-[24px] !p-6 !bg-white/[0.02] border border-white/5 focus:border-accent/40 font-black italic uppercase tracking-widest text-[11px] outline-none appearance-none cursor-pointer hover:bg-white/[0.04] transition-all"
                                    >
                                        <option value="sales" className="bg-[#090b14] text-white">Sales Strategy</option>
                                        <option value="voice" className="bg-[#090b14] text-white">Brand Voice</option>
                                        <option value="objection" className="bg-[#090b14] text-white">Objection Handling</option>
                                        <option value="success" className="bg-[#090b14] text-white">Success Path</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted/30 ml-2 italic">Trigger Keywords (neural bits)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Comma separated bits..."
                                        value={brainForm.trigger_keywords.join(',')}
                                        onChange={(e) => setBrainForm({...brainForm, trigger_keywords: e.target.value.split(',').map(s => s.trim())})}
                                        className="input-modern w-full !rounded-[24px] !p-6 !bg-white/[0.02] border-white/5 focus:border-purple-400/40 text-[13px] font-black italic tracking-tight"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted/30 ml-2 italic">Stimulus Scenario (Input Situation)</label>
                                <textarea 
                                    placeholder='Describe the exact customer situation...'
                                    value={brainForm.scenario}
                                    onChange={(e) => setBrainForm({...brainForm, scenario: e.target.value})}
                                    className="input-modern w-full h-32 !rounded-[32px] !p-8 !bg-white/[0.02] border-white/5 focus:border-purple-400/40 text-[13px] font-bold tracking-tight resize-none shadow-inner"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted/30 ml-2 italic">Golden Response (Neural Output)</label>
                                <textarea 
                                    placeholder='Define the perfect response for this stimulus...'
                                    value={brainForm.ideal_response}
                                    onChange={(e) => setBrainForm({...brainForm, ideal_response: e.target.value})}
                                    className="input-modern w-full h-48 !rounded-[32px] !p-8 !bg-white/[0.02] border-white/5 focus:border-purple-400/40 text-[13px] font-black italic tracking-tight resize-none shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="p-10 border-t border-white/5 flex justify-end gap-6 bg-white/[0.01] relative z-10">
                            <button onClick={() => setIsBrainAddOpen(false)} className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-muted/20 hover:text-white transition-all italic">ABORT</button>
                            <button 
                                onClick={handleAddBrainRule}
                                className="btn-premium flex items-center gap-4 !rounded-[24px] !px-12 !py-5 shadow-[0_20px_40px_-12px_rgba(147,51,234,0.3)] !bg-purple-600 !text-white"
                            >
                                <Brain size={24} /> 
                                <span className="text-[13px] font-black italic">FORGE LINK</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Example Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-[#06080f]/90 backdrop-blur-2xl animate-fade-up">
                    <div className="glass-card !border-white/10 w-full max-w-3xl !rounded-[56px] overflow-hidden flex flex-col shadow-[0_0_120px_rgba(0,0,0,0.9)] border border-white/10">
                        <div className="p-12 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full"></div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Neural Injection</h2>
                                <p className="text-[11px] text-accent font-black uppercase tracking-[0.4em] mt-2 italic flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                                    Manual Pattern Mapping
                                </p>
                            </div>
                            <button onClick={() => setIsAddOpen(false)} className="w-14 h-14 rounded-2xl hover:bg-white/10 flex items-center justify-center text-muted/40 hover:text-white transition-all border border-transparent hover:border-white/10 active:scale-95">
                                <X size={28} />
                            </button>
                        </div>
                        <div className="p-12 space-y-10 bg-[#090b14]/20">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted/30 ml-2 italic">Pattern Designation</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Sales_Psych_Trigger_v_0.4"
                                    value={newExampleTitle}
                                    onChange={(e) => setNewExampleTitle(e.target.value)}
                                    className="input-modern w-full !rounded-[24px] !p-6 !bg-white/[0.02] border-white/5 focus:border-accent/40 !text-lg font-black italic tracking-tight shadow-inner"
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-muted/30 italic">Neural Matrix (JSON)</label>
                                    <span className="text-[10px] text-accent/60 font-black uppercase tracking-[0.3em] bg-accent/5 px-3 py-1 rounded-lg border border-accent/10">STAND-BY FOR INPUT</span>
                                </div>
                                <textarea 
                                    placeholder='Define the neural flow matrix here...'
                                    value={newExampleJSON}
                                    onChange={(e) => setNewExampleJSON(e.target.value)}
                                    className="input-modern w-full h-80 !rounded-[32px] !p-10 font-mono text-[11px] leading-relaxed resize-none bg-black/40 border-white/5 focus:border-accent/40 shadow-inner scrollbar-hide"
                                />
                            </div>
                        </div>
                        <div className="p-10 border-t border-white/5 flex justify-end gap-6 bg-white/[0.01] relative z-10">
                            <button onClick={() => setIsAddOpen(false)} className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-muted/20 hover:text-white transition-all italic">ABORT</button>
                            <button 
                                onClick={handleAddExample}
                                className="btn-premium flex items-center gap-4 !rounded-[24px] !px-12 !py-5 shadow-[0_20px_40px_-12px_rgba(46,255,161,0.2)]"
                            >
                                <Save size={24} /> 
                                <span className="text-[13px] font-black italic">COMMIT MAP</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Training

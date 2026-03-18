import React from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    CalendarCheck,
    Activity,
    Brain,
    LogOut
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
    label: string
    icon: LucideIcon
    path: string
}

interface SidebarProps {
    onLogout: () => void
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

const navItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, path: '/' },
    { label: 'Leads', icon: Users, path: '/leads' },
    { label: 'Conversations', icon: MessageSquare, path: '/conversations' },
    { label: 'Bookings', icon: CalendarCheck, path: '/bookings' },
    { label: 'Training', icon: Brain, path: '/training' },
    { label: 'Albert Status', icon: Activity, path: '/albert' },
]

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, setIsOpen }) => {
    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-bg-base/80 backdrop-blur-sm z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsOpen(false)}
            ></div>

            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-card-sidebar border-r border-white/5 flex flex-col transform transition-transform duration-500 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-12 group cursor-pointer">
                        <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                            <img src="/favicon.png" alt="After5 Logo" className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">After<span className="text-gradient">5</span></h2>
                            <p className="text-[10px] text-muted/40 font-black uppercase tracking-[0.3em] mt-2 italic">Neural Agent v.01</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 1024) setIsOpen(false) }}
                                className={({ isActive }) => `
                                    w-full sidebar-item !text-[11px] !font-black !uppercase !tracking-[0.2em] !italic
                                    ${isActive ? 'active' : ''}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon size={18} className={isActive ? 'text-accent' : 'text-muted/40'} />
                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="flex items-center gap-4 p-4 glass-card !rounded-3xl border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/40 border border-accent/20 flex items-center justify-center text-accent font-black text-xs shadow-lg group-hover:scale-110 transition-transform italic">
                            LF
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-black text-white uppercase italic tracking-tight">Louis F.</p>
                            <p className="text-[9px] text-muted/30 font-black uppercase tracking-widest mt-1">Super Admin</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-10 h-10 rounded-xl bg-white/5 text-muted/40 hover:text-red-400 border border-transparent hover:border-red-400/20 transition-all flex items-center justify-center"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

/**
 * Student Profile — beautiful Duolingo/modern style dashboard.
 * Shows learning stats, achievements, weekly challenge activity, and analytics.
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, Cell,
    PieChart, Pie,
    XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

// Color palette for the donut chart
const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981']

export default function StudentProfile() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showBadgesModal, setShowBadgesModal] = useState(false)
    const [isWeekly, setIsWeekly] = useState(true) // weekly/monthly toggle

    const [analytics, setAnalytics] = useState(null)
    const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false)
    const [fetchingDiagnostics, setFetchingDiagnostics] = useState(false)

    useEffect(() => {
        if (user?.role === 'guest') {
            toast.error("Mehmonlar uchun profil sahifasi mavjud emas")
            navigate('/student')
            return
        }
        
        api.get('/student/profile-stats/')
            .then(r => setStats(r.data))
            .catch(() => toast.error("Ma'lumotlarni yuklab bo'lmadi"))
            .finally(() => setLoading(false))
    }, [user, navigate])

    async function handleDiagnosticsClick() {
        setShowDiagnosticsModal(true)
        if (analytics) return // already fetched
        setFetchingDiagnostics(true)
        try {
            const { data } = await api.get('/student/analytics/')
            setAnalytics(data)
        } catch {
            toast.error("Diagnostikani yuklab bo'lmadi")
        } finally {
            setFetchingDiagnostics(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    )

    if (!stats) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <p className="text-lg font-medium text-slate-500">Profil ma'lumotlari topilmadi.</p>
                <Link to="/student" className="btn-primary mt-4 inline-block">Bosh sahifaga qaytish</Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in">

                {/* ── HEADER / HERO ── */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full hero-gradient flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                            {(user?.full_name || user?.username || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                {user?.full_name || user?.username}
                            </h1>
                            <p className="text-sm text-slate-400 dark:text-slate-400 font-medium">
                                @{user?.username} &nbsp;|&nbsp; {user?.class_name ? `${user.class_name}-sinf` : 'O\'quvchi'}
                            </p>
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold mt-1">
                                Lvl {user?.level || 1} &nbsp;•&nbsp; {user?.total_xp || 0} XP
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/student" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-5 py-2.5 rounded-xl text-sm transition hover:scale-105 shadow-sm">
                            🏠 Dashbord
                        </Link>
                        <Link to="/student/history" className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold px-5 py-2.5 rounded-xl text-sm transition hover:scale-105 shadow-sm">
                            📈 Tarix
                        </Link>
                    </div>
                </div>

                {/* ── TOP THREE GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Card 1: Bilim Tahlilchisi (Real-time diagnostics) */}
                    <div className="lg:col-span-3 bg-gradient-to-b from-[#A7F3D0] to-[#E6FDF5] dark:from-emerald-950/60 dark:to-teal-950/30 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/40 flex flex-col justify-between min-h-[300px]">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-white/60 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                                📊
                            </div>
                            <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-300 leading-tight">
                                Real-vaqt bilim tahlilchisi
                            </h2>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400/90 leading-relaxed font-medium">
                                Platformamizdagi faolligingiz va javoblaringiz asosida eng kuchli va zaif tomonlaringizni tahlil qilamiz.
                            </p>
                        </div>
                        <button 
                            onClick={handleDiagnosticsClick}
                            className="w-full py-3 bg-white dark:bg-emerald-900/50 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 font-bold rounded-2xl shadow-sm text-xs transition-all duration-200 active:scale-95"
                        >
                            Diagnostika
                        </button>
                    </div>

                    {/* Card 2: Mening Yutuqlarim (Badges summary) */}
                    <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/80 flex flex-col justify-between min-h-[300px]">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {stats.achievements.slice(0, 3).map(a => (
                                    <div key={a.id} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                                        a.unlocked ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'bg-slate-100 dark:bg-slate-700 opacity-30 filter grayscale'
                                    }`} title={a.title}>
                                        {a.icon}
                                    </div>
                                ))}
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                Mening yutuqlarim: {stats.unlocked_count}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Matematika masalalarini yechib, darajangizni oshiring va yutuqlarni (badges) oching!
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowBadgesModal(true)}
                            className="w-full py-3 bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold rounded-2xl border border-slate-200/50 dark:border-slate-700 text-xs transition-all duration-200 active:scale-95"
                        >
                            Batafsil
                        </button>
                    </div>

                    {/* Card 3: Kunlik Sinovlar (Weekly tracker) */}
                    <div className="lg:col-span-6 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/80 flex flex-col justify-between min-h-[300px]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-black text-slate-900 dark:text-white">Kunlik sinovlar</h2>
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-0.5">
                                <button 
                                    onClick={() => setIsWeekly(true)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        isWeekly ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-slate-500'
                                    }`}
                                >
                                    Haftalik
                                </button>
                                <button 
                                    onClick={() => setIsWeekly(false)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        !isWeekly ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-slate-500'
                                    }`}
                                >
                                    Oylik
                                </button>
                            </div>
                        </div>

                        {/* Calendar row */}
                        {isWeekly ? (
                            <div className="grid grid-cols-7 gap-1 sm:gap-2 my-4 animate-fade-in">
                                {stats.weekly_stats.map((day, idx) => (
                                    <div key={idx} className={`flex flex-col items-center py-2.5 rounded-2xl border transition ${
                                        day.count >= 5 ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/40' :
                                        day.count > 0 ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' :
                                        'bg-slate-50/40 border-slate-100 dark:bg-slate-800/40 dark:border-slate-700/50'
                                    }`}>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{day.day_name}</span>
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5">{day.date}</span>
                                        <span className={`text-sm mt-1.5 ${day.count > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-300 dark:text-slate-700'}`}>⚡</span>
                                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{day.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="my-4 animate-fade-in space-y-2">
                                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    <div>Du</div>
                                    <div>Se</div>
                                    <div>Cho</div>
                                    <div>Pa</div>
                                    <div>Ju</div>
                                    <div>Sha</div>
                                    <div>Ya</div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                    {/* Empty cells for padding */}
                                    {Array.from({ length: stats.first_day_weekday || 0 }).map((_, idx) => (
                                        <div key={`empty-${idx}`} className="aspect-square opacity-0" />
                                    ))}
                                    {/* Month days */}
                                    {(stats.monthly_stats || []).map((day, idx) => (
                                        <div key={idx} className={`aspect-square flex flex-col items-center justify-center rounded-xl border text-xs font-black relative group transition cursor-pointer ${
                                            day.count >= 5 ? 'bg-indigo-50/70 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-300' :
                                            day.count > 0 ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/10 dark:border-emerald-900/30 dark:text-emerald-300' :
                                            'bg-slate-50/40 border-slate-100 text-slate-400 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-500'
                                        }`} title={`${day.date}-kun: ${day.count} ta savol`}>
                                            <span>{day.date}</span>
                                            {day.count > 0 && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Calendar stats breakdown */}
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-4 flex-wrap gap-3">
                            <div className="flex gap-4 text-xs font-bold">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                                    <span className="text-slate-500">TUGATILMAGAN: <strong className="text-slate-700 dark:text-slate-300">{isWeekly ? stats.incomplete_days : (stats.monthly_incomplete_days ?? 0)} kun</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    <span className="text-slate-500">NORMAL: <strong className="text-slate-700 dark:text-slate-300">{isWeekly ? stats.normal_days : (stats.monthly_normal_days ?? 0)} kun</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                    <span className="text-slate-500">ENG YAXSHI: <strong className="text-slate-700 dark:text-slate-300">{isWeekly ? stats.best_days : (stats.monthly_best_days ?? 0)} kun</strong></span>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/student')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs transition-all shadow-sm active:scale-95"
                            >
                                Start
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── FOURTH ROW: STATS DETAILS ── */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Foydalanish tafsilotlari</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* Questions count card */}
                        <div className="md:col-span-3 space-y-4">
                            
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/80 flex items-center gap-4">
                                <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                                    ✓
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Javob berilgan savollar</p>
                                    <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">{stats.total_answers}</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/80 flex items-center gap-4">
                                <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                                    ✓
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ko'nikmalarim aksi</p>
                                    <p className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">{stats.unique_topics}</p>
                                </div>
                            </div>

                        </div>

                        {/* Daily Average Bar Chart card */}
                        <div className="md:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/80 flex flex-col justify-between min-h-[260px]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 text-yellow-500 flex items-center justify-center font-bold text-base">
                                    ⌛
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kunlik o'rtacha</p>
                                    <p className="text-lg font-extrabold mt-0.5 text-slate-800 dark:text-slate-100">
                                        {stats.daily_average} <span className="text-xs text-slate-400 font-normal">savol / kun</span>
                                    </p>
                                </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="h-32 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.trend_stats} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                            labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                                        />
                                        <Bar dataKey="savollar" radius={[6, 6, 0, 0]}>
                                            {stats.trend_stats.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={index === stats.trend_stats.length - 1 ? '#84cc16' : '#a3e635'} 
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Difficulty analysis card */}
                        <div className="md:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/80 flex flex-col justify-between min-h-[260px]">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">Savollar qiyinchilik darajasi</h3>
                            
                            {stats.difficulty_stats && stats.difficulty_stats.length > 0 ? (
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="w-28 h-28 flex-shrink-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.difficulty_stats}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={30}
                                                    outerRadius={45}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {stats.difficulty_stats.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-1 overflow-hidden flex-1">
                                        {stats.difficulty_stats.map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2 text-[10px] font-bold">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="truncate text-slate-500 dark:text-slate-400 flex-1">{entry.name}</span>
                                                <span className="text-slate-700 dark:text-slate-200">{entry.value} ta</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-6">
                                    <span className="text-2xl mb-1">🎯</span>
                                    <p className="text-xs text-center">Hozircha ma'lumotlar yo'q. Mashq qilishni boshlang!</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>

            {/* ── ACHIEVEMENTS (BADGES) DETAILED MODAL ── */}
            {showBadgesModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-bounce-in border border-slate-100 dark:border-slate-700/80">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                🏆 Mening yutuqlarim
                            </h2>
                            <button 
                                onClick={() => setShowBadgesModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {stats.achievements.map(a => (
                                <div key={a.id} className={`flex items-center gap-4 p-3.5 rounded-2xl border transition ${
                                    a.unlocked 
                                        ? 'bg-indigo-50/45 border-indigo-100/60 dark:bg-indigo-950/20 dark:border-indigo-900/35' 
                                        : 'bg-slate-50 dark:bg-slate-850/40 border-slate-200/40 dark:border-slate-800/80 opacity-60'
                                }`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0 ${
                                        a.unlocked ? 'bg-indigo-100 dark:bg-indigo-900/60' : 'bg-slate-200 dark:bg-slate-700 filter grayscale'
                                    }`}>
                                        {a.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                            {a.title}
                                            {a.unlocked && <span className="text-[10px] bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">Ochildi</span>}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{a.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => setShowBadgesModal(false)}
                            className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg active:scale-95"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            )}

            {/* ── DIAGNOSTICS DETAILED MODAL ── */}
            {showDiagnosticsModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-bounce-in border border-slate-100 dark:border-slate-700/80">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                🧠 Real-vaqt diagnostika tahlili
                            </h2>
                            <button 
                                onClick={() => setShowDiagnosticsModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        {fetchingDiagnostics ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs text-slate-400">Diagnostika yuklanmoqda...</p>
                            </div>
                        ) : analytics ? (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                                
                                {/* Weak topics list */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Zaif mavzularingiz</h3>
                                    {analytics.weak_topics && analytics.weak_topics.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {analytics.weak_topics.map((t, idx) => (
                                                <span key={idx} className="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-semibold px-3 py-1.5 rounded-xl text-xs border border-rose-100 dark:border-rose-900/40">
                                                    {t.question__topic} ({t.wrong_count} ta xato)
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✨ Ajoyib! Sizda hozircha zaif mavzular aniqlanmadi.</p>
                                    )}
                                </div>

                                {/* Suggested materials */}
                                <div className="pt-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tavsiya etiladigan materiallar</h3>
                                    {analytics.suggested_materials && analytics.suggested_materials.length > 0 ? (
                                        <div className="space-y-2">
                                            {analytics.suggested_materials.map(m => (
                                                <a 
                                                    href={m.file} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    key={m.id} 
                                                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200/50 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 transition"
                                                >
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 text-lg">
                                                        {m.file_type === 'pdf' ? '📕' : m.file_type === 'youtube' ? '▶️' : '📄'}
                                                    </div>
                                                    <div className="overflow-hidden flex-1">
                                                        <h4 className="font-bold text-xs truncate text-slate-800 dark:text-slate-100">{m.title}</h4>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{m.description || "Tavsiyaviy o'quv materiali"}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400">Tavsiya etilgan materiallar mavjud emas.</p>
                                    )}
                                </div>

                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-6">Ma'lumot topilmadi.</p>
                        )}

                        <button 
                            onClick={() => setShowDiagnosticsModal(false)}
                            className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg active:scale-95"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

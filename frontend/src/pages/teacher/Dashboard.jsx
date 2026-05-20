/**
 * Teacher Dashboard — overview stats and charts (premium redesign).
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LabelList, RadialBarChart, RadialBar
} from 'recharts'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

const PALETTE = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16'
]

/* ── Stat card ─────────────────────────────────────────── */
function StatCard({ icon, label, value, gradient }) {
    return (
        <div className={`rounded-2xl p-5 text-white shadow-lg ${gradient} flex items-center gap-4`}>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm opacity-80 font-medium">{label}</p>
                <p className="text-3xl font-extrabold tracking-tight">{value ?? '—'}</p>
            </div>
        </div>
    )
}

/* ── Custom bar tooltip ────────────────────────────────── */
function BarTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-2xl border border-slate-700">
            <p className="font-bold mb-1 text-slate-200">{label}</p>
            <p className="text-indigo-400 font-semibold">{payload[0].value}%</p>
        </div>
    )
}

/* ── Custom pie tooltip ────────────────────────────────── */
function PieTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-2xl border border-slate-700">
            <p className="font-bold text-slate-200">{payload[0].name}</p>
            <p style={{ color: payload[0].payload.fill }} className="font-semibold">
                {payload[0].value} ta urinish
            </p>
        </div>
    )
}

/* ── Custom legend ─────────────────────────────────────── */
function PieLegend({ payload }) {
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {payload.map((entry, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: entry.color }} />
                    {entry.value}
                </span>
            ))}
        </div>
    )
}

/* ── Main component ────────────────────────────────────── */
export default function TeacherDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [classrooms, setClassrooms] = useState([])
    const [selectedClassroom, setSelectedClassroom] = useState('')
    const [leaderboard, setLeaderboard] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)

    useEffect(() => {
        api.get('/teacher/dashboard/')
            .then(r => setData(r.data))
            .catch(() => toast.error('Ma\'lumot yuklanmadi'))
            .finally(() => setLoading(false))

        api.get('/teacher/analytics/')
            .then(r => setAnalytics(r.data))
            .catch(e => console.error(e))

        api.get('/teacher/classrooms/')
            .then(r => {
                setClassrooms(r.data)
                if (r.data.length > 0) {
                    setSelectedClassroom(r.data[0].id)
                }
            })
    }, [])

    useEffect(() => {
        if (!selectedClassroom) return
        setLoadingLeaderboard(true)
        api.get(`/teacher/classrooms/${selectedClassroom}/leaderboard/`)
            .then(r => setLeaderboard(r.data))
            .catch(() => toast.error('Reytingni yuklab bo\'lmadi!'))
            .finally(() => setLoadingLeaderboard(false))
    }, [selectedClassroom])

    if (loading) return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    )

    const barData = (data?.test_stats || []).map(t => ({
        name: t.test_name,
        foiz: t.avg_percentage,
        urinish: t.attempts_count,
    }))

    const pieData = (data?.class_stats || []).map(c => ({
        name: c.student__class_name || 'Boshqa',
        value: c.count,
    }))

    const maxWrong = Math.max(...(data?.hard_questions?.map(q => q.wrong_count) || [1]))

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">

                {/* ── Hero ── */}
                <div className="hero-gradient rounded-3xl p-8 text-white shadow-xl">
                    <h1 className="text-3xl font-extrabold mb-1">📊 O'qituvchi paneli</h1>
                    <p className="opacity-80">Sinflar statistikasi va test natijalari</p>
                    <div className="flex gap-3 mt-4 flex-wrap">
                        <Link to="/teacher/classrooms" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition">
                            🏫 Yangi sinf
                        </Link>
                        <Link to="/teacher/tests" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition">
                            ➕ Yangi tarqatma material
                        </Link>
                        <Link to="/teacher/materials" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition">
                            📄 Material yuklash
                        </Link>
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon="📝" label="Testlar soni" value={data?.total_tests} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700" />
                    <StatCard icon="🎓" label="O'quvchilar" value={data?.total_students} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
                    <StatCard icon="✅" label="Urinishlar" value={data?.total_attempts} gradient="bg-gradient-to-br from-purple-500 to-pink-600" />
                </div>

                {/* ── Charts row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Bar chart — 3/5 width */}
                    <div className="lg:col-span-3 card">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Test natijalari</h2>
                                <p className="text-xs text-slate-400 mt-0.5">O'rtacha foiz (0–100)</p>
                            </div>
                            <span className="badge-blue text-xs">📈 Bar chart</span>
                        </div>

                        {barData.length > 0 ? (
                            <>
                                {/* SVG gradient defs */}
                                <svg width="0" height="0" style={{ position: 'absolute' }}>
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#818cf8" />
                                        </linearGradient>
                                        <linearGradient id="pieGrad0" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a8b1ff" />
                                        </linearGradient>
                                        <linearGradient id="pieGrad1" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#6ee7b7" />
                                        </linearGradient>
                                        <linearGradient id="pieGrad2" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#fcd34d" />
                                        </linearGradient>
                                        <linearGradient id="pieGrad3" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#ef4444" />
                                            <stop offset="100%" stopColor="#fca5a5" />
                                        </linearGradient>
                                        <linearGradient id="pieGrad4" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#c4b5fd" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <ResponsiveContainer width="100%" height={260} className="drop-shadow-sm">
                                    <BarChart data={barData} margin={{ top: 20, right: 10, left: -10, bottom: 60 }} barSize={40}>
                                        <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                                            angle={-30}
                                            textAnchor="end"
                                            interval={0}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={v => `${v}%`}
                                            dx={-10}
                                        />
                                        <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)', radius: 8 }} />
                                        <Bar
                                            dataKey="foiz"
                                            fill="url(#barGrad)"
                                            radius={[8, 8, 8, 8]}
                                            background={{ fill: '#f1f5f9', radius: 8 }}
                                            animationDuration={1000}
                                            animationEasing="ease-out"
                                        >
                                            <LabelList
                                                dataKey="foiz"
                                                position="top"
                                                formatter={v => `${v}%`}
                                                style={{ fontSize: 11, fontWeight: 800, fill: '#4f46e5' }}
                                                offset={8}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <span className="text-5xl mb-3">📊</span>
                                <p className="text-sm">Hali natija yo'q</p>
                            </div>
                        )}
                    </div>

                    {/* Donut pie chart — 2/5 width */}
                    <div className="lg:col-span-2 card">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sinflar bo'yicha</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Urinishlar soni</p>
                        </div>

                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260} className="drop-shadow-md">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%" cy="45%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={6}
                                        cornerRadius={10}
                                        stroke="none"
                                        animationDuration={1000}
                                        animationEasing="ease-out"
                                    >
                                        {pieData.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={`url(#pieGrad${i % 5})`}
                                                stroke="none"
                                                style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                    <Legend content={<PieLegend />} verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <span className="text-5xl mb-3">🥧</span>
                                <p className="text-sm">Hali ma'lumot yo'q</p>
                            </div>
                        )}
                    </div>

                    {/* Teacher Analytics AI - Weak Topics */}
                    {analytics && analytics.wrong_topics_chart?.length > 0 && (
                        <div className="lg:col-span-5 card border-t-4 border-t-rose-500">
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">🧠 Analiz - Eng ko'p xato ishlangan mavzular</h2>
                                <p className="text-xs text-slate-500 mt-1">Siz yaratgan testlarda talabalar quyidagi mavzularda eng ko'p adashgan.</p>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-4">
                                {analytics.wrong_topics_chart.map((item, idx) => (
                                    <div key={idx} className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex gap-3 items-center min-w-[200px] flex-1">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center font-extrabold text-rose-600 shadow-sm text-xl">{item.wrong_count}</div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.question__topic || 'Nomsiz mavzu'}</p>
                                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Xato Javoblar</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>



                {/* ── Gamification Leaderboard ── */}
                <div className="card">
                    <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl">🏆</div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sinf Reytingi (Leaderboard)</h2>
                                <p className="text-xs text-slate-400">O'quvchilarning sinf doirasidagi reytingi</p>
                            </div>
                        </div>
                        {classrooms.length > 0 && (
                            <select
                                className="input py-2 text-sm w-auto min-w-[200px]"
                                value={selectedClassroom}
                                onChange={e => setSelectedClassroom(e.target.value)}
                            >
                                {classrooms.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {loadingLeaderboard ? (
                        <div className="py-10 text-center text-slate-400">Yuklanmoqda...</div>
                    ) : leaderboard?.length > 0 ? (
                        <div className="space-y-2">
                            {leaderboard.map((student, i) => (
                                <div key={student.student_id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${i === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/40' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 dark:text-slate-200">{student.full_name}</p>
                                            <p className="text-xs font-semibold text-amber-500">Lvl {student.level} • {student.total_xp} Total XP</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{student.classroom_xp}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Sinf XP</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center text-slate-400 text-sm">
                            Bu sinfda hali reyting shakllanmagan.
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

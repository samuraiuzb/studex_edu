/**
 * Student Dashboard — progress tracker, available tests, recent results.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const gradeColor = g => g === 5 ? 'text-emerald-500' : g === 4 ? 'text-blue-500' : g === 3 ? 'text-orange-500' : 'text-red-500'
const gradeGradient = g => g >= 86 ? 'from-emerald-400 to-emerald-600' : g >= 56 ? 'from-amber-400 to-orange-500' : 'from-red-400 to-rose-600'

function ProgressRing({ pct, size = 80, stroke = 8, color = '#6366f1' }) {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const offset = circ - (pct / 100) * circ
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
    )
}

function TrendTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-700">
            <p className="font-bold text-slate-300">{payload[0].payload.test}</p>
            <p className="text-indigo-400 font-semibold">{payload[0].value}%</p>
        </div>
    )
}

export default function StudentDashboard() {
    const { user } = useAuth()
    const [tests, setTests] = useState([])
    const [history, setHistory] = useState([])
    const [progress, setProgress] = useState(null)
    const [classrooms, setClassrooms] = useState([])
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            api.get('/student/tests/'),
            api.get('/student/history/'),
            api.get('/student/progress/'),
            api.get('/student/my-classrooms/'),
            api.get('/student/analytics/').catch(() => ({ data: null })),
        ])
            .then(([t, h, p, c, a]) => {
                setTests(t.data)
                setHistory(h.data.slice(0, 5))
                setProgress(p.data)
                setClassrooms(c.data)
                if (a.data) setAnalytics(a.data)
            })
            .catch(() => toast.error('Ma\'lumot yuklanmadi'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    )

    const matPct = progress ? Math.round((progress.read_materials / (progress.total_materials || 1)) * 100) : 0
    const testPct = progress ? Math.round((progress.completed_tests / (progress.total_tests || 1)) * 100) : 0

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">

                {/* Hero */}
                <div className="hero-gradient rounded-3xl p-7 text-white shadow-xl">
                    <h1 className="text-2xl font-extrabold">
                        Xush kelibsiz, {user?.full_name || user?.username}! 👋
                    </h1>
                    <p className="opacity-80 mt-1">
                        {user?.class_name ? `${user.class_name}-sinf o'quvchisi` : 'O\'quvchi'}
                    </p>
                    <div className="flex gap-3 mt-4 flex-wrap">
                        <Link to="/student/join-classroom" className="bg-white hover:bg-slate-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-sm transition shadow-lg flex items-center gap-2">
                            <span>➕ Sinfga qo'shilish</span>
                        </Link>
                        <Link to="/student/materials" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition">📚 Materiallar</Link>
                        <Link to="/student/history" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition">📈 Natijalarim</Link>
                        <Link to="/student/leaderboard" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition">🏆 Reyting</Link>
                    </div>
                </div>

                {/* My Classrooms section */}
                {classrooms.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-4">🏫 Mening fanlarim</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {classrooms.map(c => (
                                <div key={c.id} className="card bg-white dark:bg-slate-800 border-l-4 border-indigo-500 hover:shadow-lg transition">
                                    <h3 className="font-bold text-lg mb-1">{c.name}</h3>
                                    <p className="text-sm text-slate-500 mb-2">👤 {c.teacher_name}</p>
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                        <span className="text-xs text-slate-400">Jami qatnashchilar:</span>
                                        <span className="font-semibold text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg">
                                            {c.students_count} ta
                                        </span>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Progress section */}
                {progress && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Materials progress */}
                        <div className="card flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                            <div className="relative flex-shrink-0">
                                <ProgressRing pct={matPct} color="#6366f1" />
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400"
                                    style={{ transform: 'none' }}>
                                    {matPct}%
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Materiallar</p>
                                <p className="text-2xl font-extrabold text-indigo-600">{progress.read_materials}<span className="text-sm text-slate-400 font-normal">/{progress.total_materials}</span></p>
                                <p className="text-xs text-slate-400">o'qilgan</p>
                            </div>
                        </div>

                        {/* Tests progress */}
                        <div className="card flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                            <div className="relative flex-shrink-0">
                                <ProgressRing pct={testPct} color="#10b981" />
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-600 dark:text-emerald-400"
                                    style={{ transform: 'none' }}>
                                    {testPct}%
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Testlar</p>
                                <p className="text-2xl font-extrabold text-emerald-600">{progress.completed_tests}<span className="text-sm text-slate-400 font-normal">/{progress.total_tests}</span></p>
                                <p className="text-xs text-slate-400">bajarilgan</p>
                            </div>
                        </div>

                        {/* Trend mini chart */}
                        <div className="card">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 text-center sm:text-left">📈 So'nggi trend</p>
                            {progress.trend.length > 1 ? (
                                <ResponsiveContainer width="100%" height={70}>
                                    <LineChart data={progress.trend}>
                                        <Line type="monotone" dataKey="pct" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} />
                                        <Tooltip content={<TrendTooltip />} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-5">Kamida 2 ta natija kerak</p>
                            )}
                        </div>
                    </div>
                )}

                {/* AI Analytics section */}
                {analytics && analytics.weak_topics?.length > 0 && (
                    <section className="card border-l-4 border-rose-500 bg-rose-50/30 dark:bg-rose-900/10">
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">🧠 AI Tahlili - Zaif mavzular</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Oxirgi test natijalariga ko'ra, quyidagi mavzularda ko'proq xato qilingan. Bu mavzularni takrorlash tavsiya etiladi:</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {analytics.weak_topics.map((t, idx) => (
                                <span key={idx} className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-semibold px-3 py-1.5 rounded-lg text-sm border border-rose-200 dark:border-rose-800">
                                    {t.question__topic} ({t.wrong_count} ta xato)
                                </span>
                            ))}
                        </div>

                        {analytics.suggested_materials?.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">📚 Tavsiya etiladigan materiallar:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {analytics.suggested_materials.map(m => (
                                        <a href={m.file} target="_blank" rel="noreferrer" key={m.id} className="block p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-md transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 text-xl">{m.file_type === 'pdf' ? '📕' : m.file_type === 'youtube' ? '▶️' : '📄'}</div>
                                                <div className="overflow-hidden">
                                                    <h4 className="font-bold text-sm truncate text-slate-800 dark:text-slate-100">{m.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">{m.description?.slice(0, 40)}...</p>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Available tests */}
                <section>
                    <h2 className="text-xl font-bold mb-4">📝 Mavjud elektron materiallar</h2>
                    {tests.length === 0 ? (
                        <div className="card text-center py-12 text-slate-400">
                            <p className="text-4xl mb-3">📭</p>
                            <p>Hozircha siz uchun elektron materiallar yo'q</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tests.map(test => {
                                const attempt = history.find(h => h.test_name === test.name)
                                const now = new Date()
                                const started = !test.start_date || new Date(test.start_date) <= now
                                const notEnded = !test.end_date || new Date(test.end_date) >= now
                                const isOpen = started && notEnded
                                return (
                                    <div key={test.id} className="card-hover flex flex-col gap-3">
                                        <div className="flex items-start sm:items-center gap-3 flex-col sm:flex-row text-center sm:text-left">
                                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mx-auto sm:mx-0">📝</div>
                                            <div className="flex-1 min-w-0 w-full">
                                                <h3 className="font-bold truncate" title={test.name}>{test.name}</h3>
                                                <p className="text-xs text-slate-500">
                                                    ⏱ {test.time_limit || '∞'} daqiqa &nbsp;|&nbsp; {test.questions_count} savol
                                                </p>
                                                {test.end_date && (
                                                    <p className="text-xs text-amber-500 mt-0.5">
                                                        ⏳ {new Date(test.end_date).toLocaleDateString('uz-UZ')} gacha
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {attempt && (
                                            <div className="text-xs text-slate-500 flex flex-wrap justify-center sm:justify-start items-center gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                                                <span>Oxirgi natija:</span>
                                                <span className="font-bold">{attempt.percentage}%</span>
                                                <span className={`font-bold ${gradeColor(attempt.grade)}`}>({attempt.grade}-baho)</span>
                                            </div>
                                        )}
                                        {isOpen
                                            ? <Link to={`/student/test/${test.id}`} className="btn-primary justify-center w-full">🚀 Boshlash</Link>
                                            : <button disabled className="btn-secondary justify-center w-full opacity-50 cursor-not-allowed">🔒 Yopiq</button>
                                        }
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* Recent history */}
                {history.length > 0 && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">📊 So'nggi natijalar</h2>
                            <Link to="/student/history" className="text-sm text-indigo-500 hover:underline">Barchasi →</Link>
                        </div>
                        <div className="card overflow-x-auto p-0">
                            <table className="w-full text-sm min-w-[400px]">
                                <thead className="bg-slate-100 dark:bg-slate-700">
                                    <tr>
                                        {['Test', 'Ball', 'Foiz', 'Baho'].map(h => (
                                            <th key={h} className="px-3 sm:px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {history.map(h => (
                                        <tr key={h.attempt_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-3 sm:px-4 py-2 font-medium truncate max-w-[120px] sm:max-w-[160px]" title={h.test_name}>{h.test_name}</td>
                                            <td className="px-3 sm:px-4 py-2">{h.score}/{h.total}</td>
                                            <td className="px-3 sm:px-4 py-2">{h.percentage}%</td>
                                            <td className="px-3 sm:px-4 py-2 font-bold"><span className={gradeColor(h.grade)}>{h.grade}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

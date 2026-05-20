/**
 * Student History — full attempt history with stats.
 */
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function StudentHistory() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/student/history/')
            .then(r => setHistory(r.data))
            .catch(() => toast.error('Tarix yuklanmadi'))
            .finally(() => setLoading(false))
    }, [])

    const gradeColor = g => g === 5 ? 'badge-green' : g === 4 ? 'badge-blue' : g === 3 ? 'badge-orange' : 'badge-red'

    // Stats summary
    const total = history.length
    const avgPct = total ? Math.round(history.reduce((s, h) => s + h.percentage, 0) / total) : 0
    const best = total ? Math.max(...history.map(h => h.percentage)) : 0

    if (loading) return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in space-y-6">
                <h1 className="text-2xl font-extrabold">📈 Natijalar tarixi</h1>

                {/* Summary cards */}
                {total > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Jami ishlangan materiallar", value: total, icon: '📝' },
                            { label: "O'rtacha foiz", value: `${avgPct}%`, icon: '📊' },
                            { label: "Eng yaxshi", value: `${best}%`, icon: '🏆' },
                        ].map(s => (
                            <div key={s.label} className="card text-center py-4">
                                <p className="text-2xl mb-1">{s.icon}</p>
                                <p className="text-2xl font-extrabold gradient-text">{s.value}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {history.length === 0 ? (
                    <div className="card text-center py-14 text-slate-400">
                        <p className="text-4xl mb-3">📭</p>
                        <p>Hali biror test topshirilmagan</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((h, i) => (
                            <div key={h.attempt_id} className="card-hover flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-sm flex-shrink-0">
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{h.test_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden max-w-[120px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                                style={{ width: `${h.percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500">{h.percentage}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{h.score}/{h.total}</p>
                                        <p className="text-xs text-slate-400">{h.submitted_at?.slice(0, 10)}</p>
                                    </div>
                                    <span className={gradeColor(h.grade)}>{h.grade}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

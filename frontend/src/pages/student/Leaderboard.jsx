/**
 * Student Leaderboard — sinfdoshlar reytingi
 */
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

const MEDAL = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
    const [board, setBoard] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/student/leaderboard/')
            .then(r => setBoard(r.data))
            .catch(() => toast.error('Yuklanmadi'))
            .finally(() => setLoading(false))
    }, [])

    const me = board.find(b => b.is_me)

    if (loading) return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

                {/* Header */}
                <div className="rounded-3xl p-7 mb-6 text-white shadow-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                    <h1 className="text-2xl font-extrabold mb-1">🏆 Sinf reytingi</h1>
                    <p className="text-sm opacity-80">Sinfingizda o'rtacha foiz bo'yicha reyting</p>
                    {me && (
                        <div className="mt-4 bg-white/20 rounded-2xl px-4 py-3 flex items-center justify-between">
                            <span className="font-semibold">Mening joyim</span>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-extrabold">#{me.rank}</span>
                                <span className="text-sm opacity-90">{me.avg_percentage}%</span>
                            </div>
                        </div>
                    )}
                </div>

                {board.length === 0 ? (
                    <div className="card text-center py-16 text-slate-400">
                        <p className="text-5xl mb-3">🏅</p>
                        <p>Hali hech kim test topshirmagan</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {board.map((s, i) => (
                            <div
                                key={s.student_id}
                                className={`flex items-center gap-4 rounded-2xl px-5 py-3.5 shadow-sm transition-all
                                    ${s.is_me
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/30 border-2 border-indigo-300 dark:border-indigo-600'
                                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-9 text-center flex-shrink-0">
                                    {i < 3
                                        ? <span className="text-2xl">{MEDAL[i]}</span>
                                        : <span className="text-base font-bold text-slate-400">#{s.rank}</span>
                                    }
                                </div>

                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
                                    ${s.is_me ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                    {(s.full_name || '?')[0].toUpperCase()}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-sm truncate ${s.is_me ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>
                                        {s.full_name} {s.is_me && <span className="text-xs font-normal opacity-60">(Sen)</span>}
                                    </p>
                                    <p className="text-xs text-slate-400">{s.attempts_count} ta urinish</p>
                                </div>

                                {/* Score */}
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-lg font-extrabold ${s.avg_percentage >= 86 ? 'text-emerald-600' :
                                        s.avg_percentage >= 56 ? 'text-amber-500' : 'text-red-500'
                                        }`}>{s.avg_percentage}%</p>
                                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                                        <div
                                            className={`h-full rounded-full ${s.avg_percentage >= 86 ? 'bg-emerald-500' :
                                                s.avg_percentage >= 56 ? 'bg-amber-400' : 'bg-red-400'
                                                }`}
                                            style={{ width: `${s.avg_percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Student Join Classroom page — input 6-char invite code.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function JoinClassroom() {
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleJoin(e) {
        e.preventDefault()
        if (inviteCode.length !== 6) {
            toast.error("Kod 6 ta belgidan iborat bo'lishi kerak")
            return
        }

        setLoading(true)
        try {
            const { data } = await api.post('/student/join-classroom/', { invite_code: inviteCode.toUpperCase() })
            toast.success(data.detail)
            navigate('/student', { replace: true })
        } catch (error) {
            toast.error(error.response?.data?.detail || "Xato yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-md mx-auto mt-20 px-4 animate-fade-in">
                <div className="card text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-indigo-500"></div>

                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
                        👋
                    </div>

                    <h1 className="text-2xl font-extrabold mb-2">Sinfga qo'shilish</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                        O'qituvchingiz bergan 6 xonali taklif kodini kiriting.
                    </p>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                className="w-full text-center text-3xl font-mono tracking-[0.5em] font-bold p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none uppercase transition pb-4"
                                placeholder="A1B2C3"
                                maxLength={6}
                                value={inviteCode}
                                onChange={e => setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || inviteCode.length !== 6}
                            className="btn-primary w-full justify-center py-3 text-lg"
                        >
                            {loading ? '⏳ Tekshirilmoqda...' : '✅ Qo\'shilish'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <Link to="/student" className="text-slate-400 hover:text-indigo-500 text-sm font-medium transition">
                            Qaytish
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

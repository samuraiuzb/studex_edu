/**
 * Login page — authenticates teacher or student.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
    const { login, loginAsGuest } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const user = await login(form.username, form.password)
            toast.success(`Xush kelibsiz, ${user.full_name || user.username}!`)
            navigate(user.role === 'teacher' ? '/teacher' : '/student')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Kirish xatosi!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#2563EB]/80 rounded-[20px] flex items-center justify-center text-white font-black text-5xl mx-auto mb-4 shadow-[0_8px_30px_rgb(37,99,235,0.3)]">
                        S
                    </div>
                    <h1 className="text-4xl mb-2 tracking-tight">
                        <span className="font-extrabold text-[#1F2937] dark:text-white">Stud</span>
                        <span className="font-normal text-[#2563EB]">ex</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Zamonaviy raqamli ta'lim platformasi</p>
                </div>

                {/* Card */}
                <div className="card">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6">Tizimga kirish</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="input-label">Foydalanuvchi nomi</label>
                            <input
                                className="input"
                                placeholder="username"
                                value={form.username}
                                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Parol</label>
                            <div className="relative">
                                <input
                                    className="input pr-10"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                                    title={showPassword ? "Berkitish" : "Ko'rsatish"}
                                >
                                    {showPassword ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary btn-lg w-full justify-center mt-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : '🔑 Kirish'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                        Hisobingiz yo'qmi?{' '}
                        <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                            Ro'yxatdan o'ting
                        </Link>
                    </p>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => { loginAsGuest(); navigate('/student') }}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900 group"
                    >
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">🔍</span>
                        <div className="text-left">
                            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Ro'yxatdan o'tmasdan</p>
                            <p className="font-semibold text-sm">Mehmon bo'lib ko'rish</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

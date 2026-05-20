/**
 * Register page — creates teacher or student account.
 */
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [form, setForm] = useState({
        username: '', email: '', password: '', password2: '',
        full_name: '', role: 'student', invite_code: searchParams.get('invite_code') || ''
    })
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    async function handleSubmit(e) {
        e.preventDefault()
        if (form.password !== form.password2) {
            toast.error('Parollar mos emas!')
            return
        }
        setLoading(true)
        try {
            const user = await register(form)
            toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!')
            navigate(user.role === 'teacher' ? '/teacher' : '/student')
        } catch (err) {
            const data = err.response?.data
            const msg = typeof data === 'object'
                ? Object.values(data).flat().join(' ')
                : 'Xato yuz berdi!'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#2563EB]/80 rounded-[20px] flex items-center justify-center text-white font-black text-5xl mx-auto mb-4 shadow-[0_8px_30px_rgb(37,99,235,0.3)]">
                        S
                    </div>
                    <h1 className="text-4xl mb-2 tracking-tight">
                        <span className="font-extrabold text-[#1F2937] dark:text-white">Stud</span>
                        <span className="font-normal text-[#2563EB]">ex</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Yangi hisob yaratish</p>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-6">Ro'yxatdan o'tish</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role selector */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'teacher', icon: '👨‍🏫', label: 'O\'qituvchi' },
                                { value: 'student', icon: '🎓', label: 'O\'quvchi' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, role: opt.value }))}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${form.role === opt.value
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'border-slate-200 dark:border-slate-600 text-slate-500'
                                        }`}
                                >
                                    <span className="text-2xl">{opt.icon}</span>
                                    <span className="text-sm font-medium">{opt.label}</span>
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="input-label">To'liq ism</label>
                            <input className="input" placeholder="Ism Familiya" value={form.full_name} onChange={set('full_name')} required />
                        </div>
                        <div>
                            <label className="input-label">Elektron pochta (Email)</label>
                            <input className="input" type="email" placeholder="example@mail.com" value={form.email} onChange={set('email')} required />
                        </div>
                        <div>
                            <label className="input-label">Foydalanuvchi nomi</label>
                            <input className="input" placeholder="username" value={form.username} onChange={set('username')} required />
                        </div>
                        {form.role === 'student' && (
                            <div>
                                <label className="input-label">Taklif kodi</label>
                                <input className="input" placeholder="Masalan: ABCD12" value={form.invite_code} onChange={set('invite_code')} required />
                            </div>
                        )}
                        <div>
                            <label className="input-label">Parol</label>
                            <div className="relative">
                                <input
                                    className="input pr-10"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={set('password')}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Parolni takrorlang</label>
                            <div className="relative">
                                <input
                                    className="input pr-10"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password2}
                                    onChange={set('password2')}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                                >
                                    {showPassword ? '👁️‍🗨️' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full justify-center mt-2">
                            {loading
                                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : '✅ Ro\'yxatdan o\'tish'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-slate-500 mt-4">
                        Hisobingiz bormi?{' '}
                        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Kirish</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

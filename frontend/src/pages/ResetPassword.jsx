import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ResetPassword() {
    const { uid, token } = useParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (password !== password2) {
            toast.error('Parollar mos emas!')
            return
        }
        setLoading(true)
        try {
            const { data } = await api.post('/auth/password-reset-confirm/', {
                uid, token, password
            })
            toast.success(data.detail)
            navigate('/login')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Havola noto\'g\'ri yoki muddati o\'tgan!')
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
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-6">Yangi parol o'rnatish</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="input-label">Yangi parol</label>
                            <div className="relative">
                                <input
                                    className="input pr-10"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
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
                                    value={password2}
                                    onChange={e => setPassword2(e.target.value)}
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
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : 'Saqlash'}
                        </button>
                        <Link to="/login" className="block text-center text-sm text-slate-500 hover:underline">
                            Bekor qilish
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await api.post('/auth/password-reset/', { email })
            toast.success(data.detail)
            setDone(true)
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Xato yuz berdi!')
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
                    <h2 className="text-xl font-bold mb-4">Parolni tiklash</h2>
                    {done ? (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-4">📧</div>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Agarda ushbu email tizimda mavjud bo'lsa, parolni tiklash havolasini yubordik.
                                Iltimos, pochtangizni tekshiring.
                            </p>
                            <Link to="/login" className="btn-primary w-full justify-center">
                                Login sahifasiga qaytish
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Ro'yxatdan o'tgan pochtangizni kiriting. Biz sizga parolni yangilash havolasini yuboramiz.
                            </p>
                            <div>
                                <label className="input-label">Email manzilingiz</label>
                                <input
                                    className="input"
                                    type="email"
                                    placeholder="example@mail.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full justify-center">
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : 'Yuborish'}
                            </button>
                            <Link to="/login" className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Orqaga qaytish
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

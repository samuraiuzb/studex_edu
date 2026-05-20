/**
 * ProfileEditModal — allows user to update full_name, class_name, and password.
 */
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ProfileEditModal({ onClose }) {
    const { user, updateUser } = useAuth()
    const [form, setForm] = useState({
        full_name: user?.full_name || '',
        class_name: user?.class_name || '',
        old_password: '',
        new_password: '',
        confirm_password: '',
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    function handleChange(e) {
        const { name, value } = e.target
        setForm(f => ({ ...f, [name]: value }))
        setErrors(e => ({ ...e, [name]: '' }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setErrors({})

        // Client-side validation
        if (form.new_password && form.new_password !== form.confirm_password) {
            setErrors({ confirm_password: 'Yangi parollar mos emas!' })
            return
        }

        const payload = {}
        if (form.full_name !== user?.full_name) payload.full_name = form.full_name
        if (form.class_name !== user?.class_name) payload.class_name = form.class_name
        if (form.new_password) {
            payload.old_password = form.old_password
            payload.new_password = form.new_password
        }

        if (Object.keys(payload).length === 0) {
            toast('Hech narsa o\'zgartirilmadi', { icon: 'ℹ️' })
            onClose()
            return
        }

        setLoading(true)
        try {
            await updateUser(payload)
            toast.success('Profil muvaffaqiyatli yangilandi!')
            onClose()
        } catch (err) {
            const data = err?.response?.data || {}
            if (typeof data === 'object') setErrors(data)
            else toast.error('Xatolik yuz berdi!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold text-lg">Profilni tahrirlash</h2>
                        <p className="text-blue-200 text-sm">Ma'lumotlarni yangilang</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg transition">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Full name */}
                    <div>
                        <label className="input-label">To'liq ism</label>
                        <input
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="Ism Familiya"
                            className="input"
                        />
                        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                    </div>

                    {/* Class name (students only) */}
                    {user?.role === 'student' && (
                        <div>
                            <label className="input-label">Sinf</label>
                            <input
                                name="class_name"
                                value={form.class_name}
                                onChange={handleChange}
                                placeholder="Masalan: 11A"
                                className="input"
                            />
                            {errors.class_name && <p className="text-red-500 text-xs mt-1">{errors.class_name}</p>}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                            🔒 Parolni o'zgartirish (ixtiyoriy)
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="input-label">Eski parol</label>
                                <input
                                    type="password"
                                    name="old_password"
                                    value={form.old_password}
                                    onChange={handleChange}
                                    placeholder="Hozirgi parol"
                                    className="input"
                                    autoComplete="current-password"
                                />
                                {errors.old_password && <p className="text-red-500 text-xs mt-1">
                                    {Array.isArray(errors.old_password) ? errors.old_password[0] : errors.old_password}
                                </p>}
                            </div>
                            <div>
                                <label className="input-label">Yangi parol</label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={form.new_password}
                                    onChange={handleChange}
                                    placeholder="Yangi parol"
                                    className="input"
                                    autoComplete="new-password"
                                />
                                {errors.new_password && <p className="text-red-500 text-xs mt-1">
                                    {Array.isArray(errors.new_password) ? errors.new_password[0] : errors.new_password}
                                </p>}
                            </div>
                            <div>
                                <label className="input-label">Yangi parolni tasdiqlang</label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={form.confirm_password}
                                    onChange={handleChange}
                                    placeholder="Parolni qayta kiriting"
                                    className="input"
                                    autoComplete="new-password"
                                />
                                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
                            </div>
                        </div>
                    </div>

                    {/* General errors */}
                    {errors.non_field_errors && (
                        <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                            {errors.non_field_errors}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="btn-secondary flex-1">
                            Bekor qilish
                        </button>
                        <button type="submit" disabled={loading}
                            className="btn-primary flex-1 justify-center">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Saqlanmoqda...
                                </span>
                            ) : '💾 Saqlash'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

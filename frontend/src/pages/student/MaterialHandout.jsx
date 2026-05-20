/**
 * MaterialHandout — shown after student confirms reading a material.
 * Offers "Ishlash" (go to linked test) or "Chiqish" (back to materials).
 */
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/client'

const TYPE_ICONS = { pdf: '📄', video: '🎥', image: '🖼️' }

export default function MaterialHandout() {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    // State passed from Materials page via navigate()
    const [material, setMaterial] = useState(location.state?.material || null)
    const [linkedTestId, setLinkedTestId] = useState(location.state?.linked_test_id || null)
    const [loadingMaterial, setLoadingMaterial] = useState(!material)

    // If navigated directly (e.g. page refresh), fetch material info
    useEffect(() => {
        if (material) return
        api.get('/student/materials/').then(r => {
            const found = r.data.find(m => String(m.id) === String(id))
            if (found) setMaterial(found)
        }).catch(() => { }).finally(() => setLoadingMaterial(false))
    }, [id, material])

    // Also fetch linked test if not in state
    useEffect(() => {
        if (linkedTestId !== undefined) return
        api.post(`/student/materials/${id}/read/`)
            .then(r => setLinkedTestId(r.data.linked_test_id))
            .catch(() => { })
    }, [id, linkedTestId])

    if (loadingMaterial) return (
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
            <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">

                {/* Success banner */}
                <div className="rounded-2xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-5 mb-6 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <h2 className="text-lg font-extrabold text-green-700 dark:text-green-300">
                        Barakalla! Materialni o'qib bo'ldingiz.
                    </h2>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        O'qituvchi tomonidan tayinlangan topshiriqni bajarish uchun testga o'ting.
                    </p>
                </div>

                {/* Material info card */}
                {material && (
                    <div className="card mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl flex-shrink-0">
                                {TYPE_ICONS[material.file_type] || '📄'}
                            </div>
                            <div>
                                <h3 className="font-bold text-base">{material.title}</h3>
                                {material.description && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                        {material.description}
                                    </p>
                                )}
                                {material.teacher_name && (
                                    <p className="text-xs text-slate-400 mt-1">👨‍🏫 {material.teacher_name}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Handout section */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">📋</span>
                        <div>
                            <h2 className="font-extrabold text-lg">Elektron tarqatma material</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                O'qituvchi tomonidan tayinlangan topshiriq
                            </p>
                        </div>
                    </div>

                    {linkedTestId ? (
                        <>
                            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 p-4 mb-5 text-sm text-indigo-700 dark:text-indigo-300">
                                📝 Ushbu material bo'yicha test tayinlangan. Testni ishlash orqali bilimlaringizni tekshiring.
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate(`/student/test/${linkedTestId}`)}
                                    className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base transition shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900 flex items-center justify-center gap-2"
                                >
                                    📋 Elektron tarqatma materiallarni ishlash
                                </button>
                                <button
                                    onClick={() => navigate('/student/materials')}
                                    className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2"
                                >
                                    🚪 Chiqish
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-4 mb-5 text-sm text-amber-700 dark:text-amber-300">
                                ℹ️ Bu material uchun hali test tayinlanmagan. O'qituvchingiz bilan bog'laning.
                            </div>
                            <button
                                onClick={() => navigate('/student/materials')}
                                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2"
                            >
                                🚪 Chiqish
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

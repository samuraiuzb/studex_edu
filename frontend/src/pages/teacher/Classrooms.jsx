/**
 * Teacher Classrooms page — view, create, copy invite codes.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function TeacherClassrooms() {
    const [classrooms, setClassrooms] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadClassrooms()
    }, [])

    function loadClassrooms() {
        api.get('/teacher/classrooms/')
            .then(res => setClassrooms(res.data))
            .catch(() => toast.error('Sinflarni yuklashda xato!'))
    }

    async function handleCreate(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await api.post('/teacher/classrooms/', { name })
            setClassrooms(c => [data, ...c])
            setShowForm(false)
            setName('')
            toast.success('Sinf yaratildi!')
        } catch {
            toast.error('Sinf yaratishda xato!')
        } finally {
            setLoading(false)
        }
    }

    function copyToClipboard(text, isLink = false) {
        navigator.clipboard.writeText(text)
        toast.success(isLink ? "Sinf havolasidan nusxa olindi!" : "Taklif kodidan nusxa olindi!")
    }

    function generateInviteLink(code) {
        return `${window.location.origin}/register?invite_code=${code}`
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <h1 className="text-2xl font-extrabold">🏫 Mening Sinflarim</h1>
                    <button onClick={() => setShowForm(s => !s)} className="btn-primary">
                        {showForm ? '✕ Yopish' : '➕ Yangi sinf yaratish'}
                    </button>
                </div>

                {/* Create Form */}
                {showForm && (
                    <div className="card mb-6 animate-fade-in">
                        <h2 className="text-lg font-bold mb-4">Yangi sinf yaratish</h2>
                        <form onSubmit={handleCreate} className="flex gap-4 items-end flex-wrap">
                            <div className="flex-1 min-w-[200px]">
                                <label className="input-label">Sinf nomi</label>
                                <input
                                    className="input"
                                    placeholder="Masalan: 6A matematika"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary mb-[2px]">
                                {loading ? '⏳ Yaratilmoqda...' : '✅ Saqlash'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Classrooms Grid */}
                {classrooms.length === 0 ? (
                    <div className="card text-center py-14 text-slate-400">
                        <p className="text-4xl mb-3">🏫</p>
                        <p>Hali sinf yaratilmagan</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classrooms.map(c => (
                            <div key={c.id} className="card-hover flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-1 truncate" title={c.name}>{c.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                        <span className="text-lg">👥</span> O'quvchilar: <span className="font-bold">{c.students_count}</span> ta
                                    </p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl mb-4 text-center border border-indigo-100 dark:border-indigo-800/50">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 font-semibold">Taklif kodi:</p>
                                    <div className="flex justify-center items-center gap-2">
                                        <span className="text-2xl font-mono tracking-widest font-bold text-indigo-900 dark:text-indigo-100 uppercase">
                                            {c.invite_code}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(c.invite_code)}
                                            className="p-1 rounded bg-indigo-200 dark:bg-indigo-800 hover:bg-indigo-300 dark:hover:bg-indigo-700 transition"
                                            title="Kodni nusxalash"
                                        >
                                            📋
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(generateInviteLink(c.invite_code), true)}
                                            className="p-1 rounded bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 transition"
                                            title="Sinf havolasini nusxalash"
                                        >
                                            🔗
                                        </button>
                                    </div>
                                </div>
                                <Link to={`/teacher/classrooms/${c.id}`} className="btn-secondary w-full justify-center">
                                    ⚙️ Boshqarish
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

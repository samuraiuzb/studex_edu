/**
 * Teacher Classroom Detail page — view students, add/remove, copy code.
 */
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function TeacherClassroomDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [classroom, setClassroom] = useState(null)
    const [students, setStudents] = useState([])
    const [allStudents, setAllStudents] = useState([])
    const [showStudentForm, setShowStudentForm] = useState(false)
    const [studentId, setStudentId] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadData()
    }, [id])

    function loadData() {
        Promise.all([
            api.get(`/teacher/classrooms/${id}/`),
            api.get(`/teacher/classrooms/${id}/students/`)
        ])
            .then(([cRes, sRes]) => {
                setClassroom(cRes.data)
                setStudents(sRes.data)
            })
            .catch(() => {
                toast.error('Sinfni yuklashda xato!')
                navigate('/teacher/classrooms')
            })
    }

    function loadAllStudents() {
        if (allStudents.length > 0) return
        api.get('/teacher/students/')
            .then(res => setAllStudents(res.data))
            .catch(() => toast.error('O\'quvchilarni yuklashda xato!'))
    }

    useEffect(() => {
        if (showStudentForm) {
            loadAllStudents()
        }
    }, [showStudentForm])

    async function handleAddStudent(e) {
        e.preventDefault()
        if (!studentId) {
            toast.error("O'quvchini tanlang")
            return
        }
        setLoading(true)
        try {
            await api.post(`/teacher/classrooms/${id}/add-student/`, { student_id: studentId })
            toast.success("O'quvchi qo'shildi!")
            setStudentId('')
            setShowStudentForm(false)
            loadData() // Refresh student list
        } catch {
            toast.error("Qo'shishda xato!")
        } finally {
            setLoading(false)
        }
    }

    async function handleRemoveStudent(studentIdToRemove) {
        if (!confirm("O'quvchini sinfdan olib tashlaysizmi?")) return
        try {
            await api.post(`/teacher/classrooms/${id}/remove-student/`, { student_id: studentIdToRemove })
            toast.success("O'quvchi olib tashlandi!")
            setStudents(s => s.filter(x => x.id !== studentIdToRemove))
            // Also update the classroom student count
            setClassroom(c => ({ ...c, students_count: c.students_count - 1 }))
        } catch {
            toast.error("Olib tashlashda xato!")
        }
    }

    function copyToClipboard(text, isLink = false) {
        navigator.clipboard.writeText(text)
        toast.success(isLink ? "Sinf havolasidan nusxa olindi!" : "Taklif kodidan nusxa olindi!")
    }

    function generateInviteLink(code) {
        return `${window.location.origin}/register?invite_code=${code}`
    }

    async function handleDeleteClassroom() {
        if (!confirm("Sinfni butunlay o'chirasizmi? (Testlar va materiallar o'chmaydi)")) return
        try {
            await api.delete(`/teacher/classrooms/${id}/`)
            toast.success("Sinf o'chirildi")
            navigate('/teacher/classrooms')
        } catch {
            toast.error("O'chirishda xato")
        }
    }

    if (!classroom) return (
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
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/teacher/classrooms" className="text-slate-400 hover:text-indigo-500 transition text-xl">
                        ←
                    </Link>
                    <h1 className="text-2xl font-extrabold flex-1 truncate">{classroom.name}</h1>

                    <button onClick={handleDeleteClassroom} className="btn-danger p-2" title="Sinfni o'chirish">
                        🗑
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="card text-center text-indigo-900 dark:text-white bg-white dark:bg-slate-800 border-t-4 border-indigo-500">
                            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Taklif kodi</h2>
                            <div className="flex justify-center items-center gap-2 mb-2">
                                <span className="text-4xl font-mono tracking-widest font-bold uppercase py-2">
                                    {classroom.invite_code}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 w-full mt-2">
                                <button
                                    onClick={() => copyToClipboard(classroom.invite_code)}
                                    className="btn-secondary w-full justify-center text-sm"
                                >
                                    📋 Koddan nusxa olish
                                </button>
                                <button
                                    onClick={() => copyToClipboard(generateInviteLink(classroom.invite_code), true)}
                                    className="btn-primary w-full justify-center text-sm"
                                >
                                    🔗 Havoladan nusxa olish
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-3">
                                O'quvchilar ushbu kod yoki havola orqali sinfga qo'shilishlari mumkin.
                            </p>
                        </div>

                        <div className="card">
                            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Sinf ma'lumotlari</h2>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-sm text-slate-500">O'quvchilar:</span>
                                <span className="font-bold">{classroom.students_count} ta</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-sm text-slate-500">Yaratilgan:</span>
                                <span className="font-semibold text-sm">
                                    {new Date(classroom.created_at).toLocaleDateString('uz-UZ')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Students */}
                    <div className="md:col-span-2">
                        <div className="card">
                            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                <h2 className="text-xl font-bold">Ro'yxat: {classroom.name}</h2>
                                <button onClick={() => setShowStudentForm(s => !s)} className="btn-primary text-sm">
                                    {showStudentForm ? '✕ Yopish' : '➕ O\'quvchi qo\'shish'}
                                </button>
                            </div>

                            {/* Add Student Form */}
                            {showStudentForm && (
                                <form onSubmit={handleAddStudent} className="flex gap-2 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                                    <select
                                        className="input flex-1"
                                        value={studentId}
                                        onChange={e => setStudentId(e.target.value)}
                                        required
                                    >
                                        <option value="">-- O'quvchini tanlang --</option>
                                        {allStudents
                                            .filter(s => !students.some(ext => ext.id === s.id)) // Hide already added
                                            .map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.full_name || s.username} ({s.username})
                                                </option>
                                            ))}
                                    </select>
                                    <button type="submit" disabled={loading || !studentId} className="btn-primary">
                                        {loading ? '⏳' : 'Qo\'shish'}
                                    </button>
                                </form>
                            )}

                            {/* Students List */}
                            {students.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <p className="text-4xl mb-3">👻</p>
                                    <p>Sinfda o'quvchilar yo'q.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {students.map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-lg">
                                                    {(student.full_name || student.username).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">
                                                        {student.full_name || student.username}
                                                    </p>
                                                    <p className="text-xs text-slate-400">@{student.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveStudent(student.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 p-2 rounded-lg transition"
                                                title="O'chirish"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Teacher Materials page — upload and manage PDF/video/image materials.
 * Supports file upload OR YouTube link for video type.
 * Includes inline modal viewer so teachers can preview files directly.
 */
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

const ICONS = { pdf: '📄', video: '🎥', image: '🖼️', youtube: '▶️', word: '📝', ppt: '📊' }

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extract YouTube video ID from any YouTube URL format */
function getYouTubeId(url) {
    if (!url) return null
    try {
        const u = new URL(url)
        if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
        if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
    } catch (_) { }
    return null
}

/** Convert any YouTube URL to embed URL */
function toEmbedUrl(url) {
    const id = getYouTubeId(url)
    return id ? `https://www.youtube.com/embed/${id}` : null
}

// ── Material Viewer Modal ─────────────────────────────────────────────────────

function MaterialViewer({ material, onClose }) {
    if (!material) return null

    let fileUrl = material.file || ''
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        try { fileUrl = new URL(fileUrl).pathname } catch (_) { }
    }

    const embedUrl = material.youtube_url ? toEmbedUrl(material.youtube_url) : null

    const renderContent = () => {
        // YouTube video
        if (embedUrl) {
            return (
                <div className="w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe
                        src={embedUrl}
                        title={material.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-lg"
                        style={{ minHeight: '400px' }}
                    />
                </div>
            )
        }
        if (material.file_type === 'pdf') {
            return (
                <object
                    data={fileUrl}
                    type="application/pdf"
                    className="w-full h-full rounded-lg"
                    style={{ minHeight: '500px' }}
                >
                    <embed src={fileUrl} type="application/pdf" className="w-full h-full" style={{ minHeight: '500px' }} />
                    <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
                        <span className="text-5xl">📄</span>
                        <p>PDF ko'rsatilmadi. Yuklab oling.</p>
                        <a href={fileUrl} download className="btn-primary">⬇️ Yuklab olish</a>
                    </div>
                </object>
            )
        }
        if (material.file_type === 'video') {
            return (
                <video
                    src={fileUrl}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: 'calc(90vh - 130px)' }}
                >
                    Brauzeringiz video formatini qo'llab-quvvatlamaydi.
                </video>
            )
        }
        if (material.file_type === 'image') {
            return (
                <div className="flex items-center justify-center h-full">
                    <img
                        src={fileUrl}
                        alt={material.title}
                        className="max-w-full object-contain rounded-lg"
                        style={{ maxHeight: 'calc(90vh - 130px)' }}
                    />
                </div>
            )
        }
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <span className="text-6xl">📁</span>
                <p className="text-slate-500">Bu fayl turini ko'rsatib bo'lmaydi.</p>
                <a href={fileUrl} download className="btn-primary">⬇️ Yuklab olish</a>
            </div>
        )
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full flex flex-col"
                style={{ maxWidth: '900px', height: '90vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{embedUrl ? '▶️' : ICONS[material.file_type]}</span>
                        <div>
                            <h2 className="font-bold text-slate-800 dark:text-white">{material.title}</h2>
                            <span className="text-xs text-slate-400 uppercase">
                                {embedUrl ? 'YouTube Video' : material.file_type}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {embedUrl ? (
                            <a
                                href={material.youtube_url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-secondary text-xs px-3 py-1.5"
                                onClick={e => e.stopPropagation()}
                            >
                                🔗 YouTube'da ochish
                            </a>
                        ) : (
                            <>
                                <a href={fileUrl} download className="btn-secondary text-xs px-3 py-1.5" onClick={e => e.stopPropagation()}>
                                    ⬇️ Yuklab olish
                                </a>
                                <a href={fileUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs px-3 py-1.5" onClick={e => e.stopPropagation()}>
                                    🔗 Yangi tabda
                                </a>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TeacherMaterials() {
    const [materials, setMaterials] = useState([])
    const [classrooms, setClassrooms] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        title: '', description: '', file: null,
        youtube_url: '', file_type: 'pdf', classroom: ''
    })
    const [loading, setLoading] = useState(false)
    const [viewingMaterial, setViewingMaterial] = useState(null)

    useEffect(() => {
        api.get('/teacher/materials/').then(r => setMaterials(r.data)).catch(() => toast.error('Yuklanmadi'))
        api.get('/teacher/classrooms/').then(r => setClassrooms(r.data))
    }, [])

    async function handleUpload(e) {
        e.preventDefault()

        // Validation
        if (form.file_type !== 'youtube' && !form.file) {
            toast.error('Fayl tanlang!'); return
        }
        if (form.file_type === 'youtube') {
            if (!form.youtube_url) { toast.error('YouTube havolasini kiriting!'); return }
            if (!getYouTubeId(form.youtube_url)) { toast.error("Noto'g'ri YouTube havola formati!"); return }
        }

        setLoading(true)
        try {
            const fd = new FormData()
            fd.append('title', form.title)
            fd.append('description', form.description)
            fd.append('file_type', form.file_type)
            if (form.classroom) fd.append('classroom', form.classroom)

            if (form.file_type === 'youtube') {
                fd.append('youtube_url', form.youtube_url)
            } else {
                fd.append('file', form.file)
            }

            const { data } = await api.post('/teacher/materials/', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setMaterials(m => [data, ...m])
            setShowForm(false)
            setForm({ title: '', description: '', file: null, youtube_url: '', file_type: 'pdf', classroom: '' })
            toast.success('Material yuklandi!')
        } catch {
            toast.error('Yuklashda xato!')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id) {
        if (!confirm('Materialni o\'chirishni tasdiqlaysizmi?')) return
        try {
            await api.delete(`/teacher/materials/${id}/`)
            setMaterials(m => m.filter(x => x.id !== id))
            toast.success('Material o\'chirildi')
        } catch { toast.error('Xato!') }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold">📚 Materiallar</h1>
                    <button onClick={() => setShowForm(s => !s)} className="btn-primary">
                        {showForm ? '✕ Yopish' : '⬆️ Yuklash'}
                    </button>
                </div>

                {showForm && (
                    <div className="card mb-6 animate-fade-in">
                        <h2 className="font-bold mb-4">Yangi material yuklash</h2>
                        <form onSubmit={handleUpload} className="space-y-3">
                            {/* Title */}
                            <div>
                                <label className="input-label">Sarlavha *</label>
                                <input className="input" placeholder="Geometriya — 8-sinf" value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="input-label">Tavsif</label>
                                <textarea className="input" rows={2} value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>

                            {/* File type + Classroom */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="input-label">Fayl turi</label>
                                    <select className="input" value={form.file_type}
                                        onChange={e => setForm(f => ({ ...f, file_type: e.target.value }))}>
                                        <option value="pdf">PDF</option>
                                        <option value="video">Video</option>
                                        <option value="youtube">YouTube Video</option>
                                        <option value="image">Rasm</option>
                                        <option value="word">Word</option>
                                        <option value="ppt">PPTX</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Sinf</label>
                                    <select className="input" value={form.classroom}
                                        onChange={e => setForm(f => ({ ...f, classroom: e.target.value }))}>
                                        <option value="">-- Barcha sinflar --</option>
                                        {classrooms.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* File input OR YouTube URL input */}
                            {form.file_type === 'youtube' ? (
                                <div>
                                    <label className="input-label">YouTube havola *</label>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-2xl">▶️</span>
                                        <input
                                            className="input"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={form.youtube_url}
                                            onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
                                        />
                                    </div>
                                    {/* Live preview thumbnail */}
                                    {getYouTubeId(form.youtube_url) && (
                                        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600" style={{ aspectRatio: '16/9', maxHeight: '200px' }}>
                                            <iframe
                                                src={`https://www.youtube.com/embed/${getYouTubeId(form.youtube_url)}`}
                                                title="preview"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="input-label">Fayl *</label>
                                    <input type="file"
                                        accept={form.file_type === 'pdf' ? '.pdf' : form.file_type === 'video' ? 'video/*' : form.file_type === 'word' ? '.docx,.doc' : form.file_type === 'ppt' ? '.pptx,.ppt' : 'image/*'}
                                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                        onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))} />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? '⏳ Yuklanmoqda...' : '⬆️ Yuklash'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Bekor</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {materials.length === 0 && (
                        <div className="card text-center py-12 text-slate-400 col-span-2">
                            <p className="text-4xl mb-3">📭</p><p>Hali material yuklanmagan</p>
                        </div>
                    )}
                    {materials.map(m => {
                        const hasYouTube = !!m.youtube_url
                        return (
                            <div key={m.id} className="card-hover flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${hasYouTube ? 'bg-red-100 dark:bg-red-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                                    {hasYouTube ? '▶️' : ICONS[m.file_type]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm line-clamp-1">{m.title}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{m.description}</p>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {(m.classroom_name || m.class_name) && <span className="badge-blue text-xs">{m.classroom_name || m.class_name}</span>}
                                        <span className={`badge text-xs ${hasYouTube ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'}`}>
                                            {hasYouTube ? 'YouTube' : m.file_type.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => setViewingMaterial(m)}
                                            className="btn-secondary text-xs px-2 py-1"
                                        >
                                            👁 Ko'rish
                                        </button>
                                        <button onClick={() => handleDelete(m.id)} className="btn-danger text-xs px-2 py-1">🗑</button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Material Viewer Modal */}
            {viewingMaterial && (
                <MaterialViewer
                    material={viewingMaterial}
                    onClose={() => setViewingMaterial(null)}
                />
            )}
        </div>
    )
}

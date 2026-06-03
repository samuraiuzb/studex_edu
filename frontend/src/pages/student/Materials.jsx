/**
 * Student Materials — inline viewer with download button.
 * "Ko'rib bo'ldim" appears when:
 *   - PDF/Word/TXT → user scrolls to the bottom of the document
 *   - Video         → video plays to the end (onEnded)
 *   - Image         → image loaded and 3 s elapsed
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

const TYPE_ICONS = { pdf: '📄', video: '🎥', image: '🖼️', youtube: '▶️', word: '📝', ppt: '📊' }
const TYPE_LABELS = { pdf: 'PDF', video: 'Video', image: 'Rasm', youtube: 'YouTube', word: 'Word', ppt: 'PPT' }

// ── Helpers ──────────────────────────────────────────────────────────────────
function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}
function toEmbedUrl(url) {
    const id = getYouTubeId(url)
    return id ? `https://www.youtube.com/embed/${id}` : null
}

// ─── Helper: is this a text-based file? ─────────────────────────
function isTextFile(url = '') {
    return /\.(txt|text)(\?.*)?$/i.test(url)
}
function isDocFile(url = '') {
    return /\.(doc|docx)(\?.*)?$/i.test(url)
}
function isPdfFile(url = '') {
    return /\.(pdf)(\?.*)?$/i.test(url)
}

/* ── Scroll-to-bottom detector for the document viewer ── */
function useScrollFinished(containerRef, enabled, recheckTrigger) {
    const [finished, setFinished] = useState(false)

    const check = useCallback(() => {
        if (finished || !containerRef.current) return
        const el = containerRef.current
        // If content fits without scrolling — mark done immediately
        if (el.scrollHeight <= el.clientHeight + 30) { setFinished(true); return }
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) setFinished(true)
    }, [finished, containerRef])

    useEffect(() => {
        if (!enabled) return
        const el = containerRef.current
        if (!el) return
        el.addEventListener('scroll', check, { passive: true })
        check() // immediate check for short docs
        return () => el.removeEventListener('scroll', check)
    }, [enabled, check, containerRef, recheckTrigger])

    return finished
}

/* ── TXT viewer: fetch text, render in scrollable div ── */
function TxtViewer({ url, containerRef, onReady }) {
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(url)
            .then(r => r.text())
            .then(t => setText(t))
            .catch(() => setText('Fayl o\'qilmadi.'))
            .finally(() => { setLoading(false); onReady?.() })
    }, [url, onReady])

    if (loading) return (
        <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div
            ref={containerRef}
            className="overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
            style={{ height: '62vh' }}
        >
            <pre className="text-sm whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200 p-5 leading-relaxed">
                {text}
            </pre>
        </div>
    )
}

/* ── PDF / Word / PPT viewer ── */
function DocViewer({ url, containerRef }) {
    // google docs viewer needs absolute url
    const absoluteUrl = url.startsWith('http') ? url : window.location.origin + url
    const isPDF = isPdfFile(url)

    // For Word/PPT we MUST use Google Docs Viewer because browser cannot show them natively.
    // For PDF, we can use <iframe> directly (native) or Google Docs Viewer (as fallback).
    const viewerUrl = isPDF ? url : `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`

    return (
        <div
            ref={containerRef}
            className="overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
            style={{ height: '62vh' }}
        >
            <iframe
                src={viewerUrl}
                title="Document Viewer"
                style={{ width: '100%', height: '300vh', display: 'block', border: 'none' }}
                loading="lazy"
            >
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                    <p className="text-3xl">📄</p>
                    <p className="text-sm">Fayl inline ko'rsatilmadi.</p>
                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 underline text-sm">
                        Yangi tabda ochish
                    </a>
                </div>
            </iframe>
        </div>
    )
}

/* ── Inline Viewer Modal ─────────────────────────────────────── */
function ViewerModal({ material, onClose, onConfirm, confirming }) {
    const [finished, setFinished] = useState(false)
    const [recheckTrigger, setRecheck] = useState(0)   // increments when TxtViewer loads
    const scrollRef = useRef(null)
    const videoRef = useRef(null)
    const url = material.file

    // Detect document type
    const isDoc = material.file_type === 'pdf' || material.file_type === 'word' || material.file_type === 'ppt' || isPdfFile(url) || isDocFile(url)
    const isTxt = isTextFile(url)
    const isDocOrTxt = isDoc || isTxt

    // Scroll-to-bottom detection; recheckTrigger re-runs the effect when TxtViewer loads
    const scrollFinished = useScrollFinished(scrollRef, isDocOrTxt && !finished, recheckTrigger)

    useEffect(() => {
        if (scrollFinished) setFinished(true)
    }, [scrollFinished])


    // Image: mark finished after 3 s
    useEffect(() => {
        if (material.file_type === 'image') {
            const t = setTimeout(() => setFinished(true), 3000)
            return () => clearTimeout(t)
        }
    }, [material.file_type])

    // YouTube: mark finished after 15 s
    useEffect(() => {
        if (material.youtube_url) {
            const t = setTimeout(() => setFinished(true), 15000)
            return () => clearTimeout(t)
        }
    }, [material.youtube_url])

    // Close on ESC
    useEffect(() => {
        const h = e => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [onClose])

    function handleVideoEnded() { setFinished(true) }

    // ── Render viewer based on type ──────────────────────────────
    function renderViewer() {
        const embedUrl = material.youtube_url ? toEmbedUrl(material.youtube_url) : null
        if (embedUrl) {
            return (
                <div className="w-full" style={{ aspectRatio: '16/9' }}>
                    <iframe
                        src={embedUrl}
                        title={material.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="w-full rounded-xl max-h-[62vh]"
                        style={{ height: '62vh' }}
                    />
                </div>
            )
        }
        if (material.file_type === 'video') {
            return (
                <video
                    ref={videoRef}
                    src={url}
                    controls
                    onEnded={handleVideoEnded}
                    className="w-full rounded-xl max-h-[62vh] bg-black"
                    controlsList="nodownload"
                />
            )
        }
        if (material.file_type === 'image') {
            return (
                <img
                    src={url}
                    alt={material.title}
                    className="w-full rounded-xl object-contain max-h-[62vh]"
                />
            )
        }
        // TXT
        if (isTxt) {
            return <TxtViewer url={url} containerRef={scrollRef} onReady={() => setRecheck(n => n + 1)} />
        }
        // PDF / Word / default document
        return <DocViewer url={url} containerRef={scrollRef} />
    }

    // ── Footer: Ko'rib bo'ldim ───────────────────────────────────
    function renderFooter() {
        if (finished) {
            return (
                <button
                    onClick={onConfirm}
                    disabled={confirming}
                    className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition shadow-lg disabled:opacity-60 animate-fade-in"
                >
                    {confirming ? '⏳ Yuklanmoqda...' : '✅ Ko\'rib bo\'ldim'}
                </button>
            )
        }

        // Document hint — scroll to bottom
        if (isDocOrTxt) {
            return (
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm justify-center py-1.5">
                    <span className="text-lg">👇</span>
                    Oxirigacha o'qing — "Ko'rib bo'ldim" tugmasi paydo bo'ladi
                </div>
            )
        }
        // Video hint
        if (material.file_type === 'video') {
            return (
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm justify-center py-1.5">
                    <span className="text-lg">▶️</span>
                    Videoni oxirigacha ko'ring — tugma paydo bo'ladi
                </div>
            )
        }
        // Image
        return (
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm justify-center py-1.5">
                <span className="text-lg">🖼️</span>
                Biroz kuting...
            </div>
        )
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-fade-in">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{material.youtube_url ? TYPE_ICONS['youtube'] : (TYPE_ICONS[material.file_type] ?? '📄')}</span>
                        <h2 className="font-bold text-sm line-clamp-1">{material.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {material.youtube_url ? (
                            <a
                                href={material.youtube_url}
                                target="_blank"
                                rel="noreferrer"
                                title="YouTube'da ochish"
                                className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 transition flex items-center gap-1"
                            >
                                🔗 YouTube
                            </a>
                        ) : (
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                title="Yangi tabda ochish / Yuklab olish"
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition flex items-center gap-1"
                            >
                                ⬇ Yuklash
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                        >✕</button>
                    </div>
                </div>

                {/* Viewer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900">
                    {renderViewer()}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700">
                    {renderFooter()}
                </div>
            </div>
        </div>
    )
}

/* ── Main Materials Page ─────────────────────────────────────── */
export default function StudentMaterials() {
    const [materials, setMaterials] = useState([])
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [confirming, setConfirming] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        api.get('/student/materials/')
            .then(r => setMaterials(r.data))
            .catch(() => toast.error('Materiallar yuklanmadi'))
            .finally(() => setLoading(false))
    }, [])

    const filtered = filter === 'all' ? materials : materials.filter(m => m.file_type === filter)

    async function handleConfirmRead() {
        if (!selected) return
        setConfirming(true)
        try {
            const { data } = await api.post(`/student/materials/${selected.id}/read/`)
            toast.success('Material o\'qildi deb belgilandi ✅')
            navigate(`/student/materials/${selected.id}/handout`, {
                state: { material: selected, linked_test_id: data.linked_test_id }
            })
        } catch {
            toast.error('Xato yuz berdi')
        } finally {
            setConfirming(false)
            setSelected(null)
        }
    }

    if (loading) return (
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
            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <h1 className="text-2xl font-extrabold">📚 O'quv Materiallar</h1>
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'pdf', 'video', 'youtube', 'image', 'word', 'ppt'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${filter === t
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {t === 'all' ? '🗂 Barchasi' : `${TYPE_ICONS[t]} ${TYPE_LABELS[t]}`}
                            </button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="card text-center py-14 text-slate-400">
                        <p className="text-4xl mb-3">📭</p>
                        <p>Hali material mavjud emas</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(m => (
                            <div key={m.id} className="card-hover flex flex-col">
                                <div className={`h-32 rounded-xl flex items-center justify-center text-5xl mb-3 ${m.youtube_url ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/40 dark:to-orange-900/40' : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600'}`}>
                                    {m.youtube_url ? TYPE_ICONS['youtube'] : TYPE_ICONS[m.file_type]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`badge ${m.youtube_url ? 'badge-orange' : m.file_type === 'pdf' ? 'badge-red' : m.file_type === 'video' ? 'badge-blue' : m.file_type === 'word' ? 'badge-blue' : m.file_type === 'ppt' ? 'badge-orange' : 'badge-green'}`}>
                                            {m.youtube_url ? TYPE_LABELS['youtube'] : TYPE_LABELS[m.file_type]}
                                        </span>
                                        {m.class_name && <span className="badge-purple">{m.class_name}</span>}
                                    </div>
                                    <h3 className="font-bold text-sm line-clamp-2 mb-1">{m.title}</h3>
                                    {m.description && <p className="text-xs text-slate-500 line-clamp-2">{m.description}</p>}
                                    <p className="text-xs text-slate-400 mt-1">📅 {m.created_at?.slice(0, 10)}</p>
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => setSelected(m)}
                                        className="btn-primary flex-1 justify-center text-xs py-2"
                                    >
                                        👁 Ko'rish
                                    </button>
                                    {m.youtube_url ? (
                                        <a
                                            href={m.youtube_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="YouTube'da ochish"
                                            className="btn-secondary text-xs px-3 py-2 flex items-center !bg-red-50 dark:!bg-red-900/30 !text-red-600 dark:!text-red-400"
                                        >
                                            ▶
                                        </a>
                                    ) : (
                                        <a
                                            href={m.file}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Yuklab olish"
                                            className="btn-secondary text-xs px-3 py-2 flex items-center"
                                        >
                                            ⬇
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <ViewerModal
                    material={selected}
                    onClose={() => setSelected(null)}
                    onConfirm={handleConfirmRead}
                    confirming={confirming}
                />
            )}
        </div>
    )
}

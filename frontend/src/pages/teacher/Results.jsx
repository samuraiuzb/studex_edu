/**
 * Teacher Results page — view student results for a test, export to Excel.
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function TeacherResults() {
    const { id } = useParams()
    const [results, setResults] = useState([])
    const [testName, setTestName] = useState('')
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        Promise.all([api.get(`/teacher/tests/${id}/`), api.get(`/teacher/tests/${id}/results/`)])
            .then(([t, r]) => { setTestName(t.data.name); setResults(r.data) })
            .catch(() => toast.error('Yuklanmadi'))
            .finally(() => setLoading(false))
    }, [id])

    async function handleExport() {
        setExporting(true)
        try {
            const resp = await api.get(`/teacher/tests/${id}/export/`, { responseType: 'blob' })
            const url = URL.createObjectURL(resp.data)
            const a = document.createElement('a')
            a.href = url; a.download = `${testName}_natijalar.xlsx`; a.click()
            URL.revokeObjectURL(url)
            toast.success('Excel yuklab olindi!')
        } catch { toast.error('Eksport xatosi!') }
        finally { setExporting(false) }
    }

    const gradeColor = g => g === 5 ? 'badge-green' : g === 4 ? 'badge-blue' : g === 3 ? 'badge-orange' : 'badge-red'

    if (loading) return <div className="min-h-screen"><Navbar /><div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div></div>

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
                <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                    <div>
                        <Link to="/teacher/tests" className="text-xs text-slate-400 hover:text-blue-500 mb-1 block">← Testlar</Link>
                        <h1 className="text-2xl font-extrabold">📊 {testName} — Natijalar</h1>
                        <p className="text-slate-500 text-sm mt-1">{results.length} ta o'quvchi topshirdi</p>
                    </div>
                    <button onClick={handleExport} disabled={exporting} className="btn-success btn-lg">
                        {exporting ? '⏳...' : '📥 Excel yuklab olish'}
                    </button>
                </div>

                {results.length === 0 ? (
                    <div className="card text-center py-14 text-slate-400">
                        <p className="text-4xl mb-3">📭</p>
                        <p>Hali hech kim topshirmagan</p>
                    </div>
                ) : (
                    <div className="card overflow-hidden p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-700">
                                    <tr>
                                        {["#", "O'quvchi", "Sinf", "Ball", "Foiz", "Baho", "Topshirilgan"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {results.map((r, i) => (
                                        <tr key={r.attempt_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                                            <td className="px-4 py-3 font-medium">{r.student}</td>
                                            <td className="px-4 py-3"><span className="badge-blue">{r.class_name || '—'}</span></td>
                                            <td className="px-4 py-3">{r.score}/{r.total}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.percentage}%` }} />
                                                    </div>
                                                    <span>{r.percentage}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><span className={gradeColor(r.grade)}>{r.grade}</span></td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">{r.submitted_at?.slice(0, 16)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

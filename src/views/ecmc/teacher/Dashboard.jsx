import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { apiGetTeacherDashboard, apiGetTeacherStudents } from '@/services/DashboardService'
import { useSessionUser } from '@/store/authStore'
import {
    TbLoader, TbClipboardCheck, TbUsers, TbChartBar,
    TbTrophy, TbSearch, TbAlertCircle, TbRefresh,
} from 'react-icons/tb'

const StatCard = ({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-primary/10' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`text-2xl ${color}`} />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </div>
)

const SectionTitle = ({ title }) => (
    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3">{title}</h2>
)

const TeacherDashboard = () => {
    const user = useSessionUser((s) => s.user)
    const navigate = useNavigate()

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    // Students panel
    const [students, setStudents] = useState([])
    const [studentsLoading, setStudentsLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState(null)

    useEffect(() => {
        apiGetTeacherDashboard()
            .then((res) => setData(res?.data ?? res))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        setStudentsLoading(true)
        apiGetTeacherStudents({ search, page, per_page: 10 })
            .then((res) => {
                const payload = res?.data ?? res
                setStudents(payload?.data ?? payload ?? [])
                setMeta(payload?.meta ?? null)
            })
            .finally(() => setStudentsLoading(false))
    }, [search, page])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
                <TbLoader className="text-3xl animate-spin" />
                <span>Loading dashboard…</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
                <TbAlertCircle className="text-4xl text-red-400" />
                <span>Failed to load dashboard. Please refresh.</span>
            </div>
        )
    }

    const stats = data ?? {}
    const topQuizzes = stats.top_quizzes ?? []
    const recentAttempts = stats.recent_attempts ?? []

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome, {user?.firstName || user?.name || 'Teacher'} 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Here's an overview of your classes and quizzes.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={TbClipboardCheck} label="My Quizzes" value={stats.total_quizzes} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
                <StatCard icon={TbChartBar} label="Questions" value={stats.total_questions} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-900/20" />
                <StatCard icon={TbUsers} label="Total Attempts" value={stats.total_attempts} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
                <StatCard icon={TbTrophy} label="Avg Score" value={stats.avg_score != null ? `${stats.avg_score}%` : '—'} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Quizzes */}
                {topQuizzes.length > 0 && (
                    <div>
                        <SectionTitle title="Top Quizzes" />
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Quiz</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Attempts</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Avg Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {topQuizzes.map((q, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{q.title}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{q.attempts_count ?? '—'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{q.avg_score != null ? `${q.avg_score}%` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent Attempts */}
                {recentAttempts.length > 0 && (
                    <div>
                        <SectionTitle title="Recent Student Attempts" />
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Student</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Quiz</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {recentAttempts.map((a, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{a.student_name ?? a.user_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.quiz_title ?? '—'}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.score != null ? `${a.score}%` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Students List */}
            <div>
                <SectionTitle title="My Students" />
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                placeholder="Search students…"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                            />
                        </div>
                        {studentsLoading && <TbRefresh className="text-gray-400 animate-spin" />}
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
                                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Attempts</th>
                                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Avg Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-400">
                                        {studentsLoading ? 'Loading…' : 'No students found.'}
                                    </td>
                                </tr>
                            ) : (
                                students.map((s, i) => (
                                    <tr key={s.id ?? i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                        <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{s.name ?? `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim()}</td>
                                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{s.email}</td>
                                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{s.attempts_count ?? '—'}</td>
                                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{s.avg_score != null ? `${s.avg_score}%` : '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {meta && meta.last_page > 1 && (
                        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
                            <span>Page {meta.current_page} of {meta.last_page}</span>
                            <div className="flex gap-2">
                                <button
                                    className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Prev
                                </button>
                                <button
                                    className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40"
                                    disabled={page >= meta.last_page}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TeacherDashboard

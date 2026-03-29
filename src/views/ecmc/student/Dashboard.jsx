import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { apiGetStudentDashboard } from '@/services/DashboardService'
import { useSessionUser } from '@/store/authStore'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import {
    TbLoader, TbClipboardCheck, TbPencil, TbChartBar,
    TbCreditCard, TbCalendar, TbCheck, TbClock, TbTrophy,
    TbAlertCircle,
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

const StatusBadge = ({ status }) => {
    const map = {
        completed: 'bg-emerald-100 text-emerald-700',
        pending:   'bg-amber-100 text-amber-700',
        ongoing:   'bg-blue-100 text-blue-700',
        failed:    'bg-red-100 text-red-600',
        active:    'bg-emerald-100 text-emerald-700',
        expired:   'bg-gray-100 text-gray-500',
    }
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    )
}

const StudentDashboard = () => {
    const navigate = useNavigate()
    const user = useSessionUser((s) => s.user)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        apiGetStudentDashboard()
            .then((res) => setData(res?.data ?? res))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

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

    const quiz = data?.quiz_stats ?? {}
    const practice = data?.practice_stats ?? {}
    const subscription = data?.subscription ?? null
    const recentAttempts = data?.recent_attempts ?? []

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user?.firstName || user?.name || 'Student'} 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Here's a summary of your learning activity.
                </p>
            </div>

            {/* Quiz Stats */}
            <div>
                <SectionTitle title="Quiz Overview" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={TbClipboardCheck} label="Total Quizzes" value={quiz.total} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
                    <StatCard icon={TbCheck} label="Completed" value={quiz.completed} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                    <StatCard icon={TbTrophy} label="Avg Score" value={quiz.avg_score != null ? `${quiz.avg_score}%` : '—'} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20" />
                    <StatCard icon={TbClock} label="In Progress" value={quiz.in_progress} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
                </div>
            </div>

            {/* Practice Stats */}
            <div>
                <SectionTitle title="Practice Sets Overview" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard icon={TbPencil} label="Total Sets" value={practice.total} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-900/20" />
                    <StatCard icon={TbCheck} label="Completed" value={practice.completed} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                    <StatCard icon={TbChartBar} label="Avg Score" value={practice.avg_score != null ? `${practice.avg_score}%` : '—'} color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" />
                </div>
            </div>

            {/* Subscription */}
            {subscription && (
                <div>
                    <SectionTitle title="My Subscription" />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <TbCreditCard className="text-2xl text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{subscription.plan_name ?? 'Plan'}</p>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                    <TbCalendar className="text-base" />
                                    <span>Expires: {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : '—'}</span>
                                    {subscription.days_remaining != null && (
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${subscription.days_remaining <= 7 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {subscription.days_remaining}d left
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <StatusBadge status={subscription.status} />
                    </div>
                </div>
            )}

            {/* Recent Attempts */}
            {recentAttempts.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <SectionTitle title="Recent Attempts" />
                        <button
                            className="text-sm text-primary hover:underline"
                            onClick={() => navigate(`${ECMC_PREFIX_PATH}/student/my-attempts`)}
                        >
                            View all
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Quiz / Practice</th>
                                    <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Score</th>
                                    <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                                    <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentAttempts.map((a, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                        <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">{a.title ?? a.quiz_title ?? a.practice_title ?? '—'}</td>
                                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                                            {a.score != null ? `${a.score}%` : '—'}
                                        </td>
                                        <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                                            {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentDashboard

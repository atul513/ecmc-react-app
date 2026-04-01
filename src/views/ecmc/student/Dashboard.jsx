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
        passed:    'bg-emerald-100 text-emerald-700',
        pending:   'bg-amber-100 text-amber-700',
        ongoing:   'bg-blue-100 text-blue-700',
        in_progress: 'bg-blue-100 text-blue-700',
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

    // Derived quiz values
    const quizTotal = quiz.total_attempts ?? quiz.total ?? 0
    const quizCompleted = (quizTotal - (quiz.in_progress ?? 0)) || quiz.completed || 0
    const quizAvg = quiz.avg_score ?? quiz.best_score ?? 0
    const quizInProgress = quiz.in_progress ?? 0

    // Derived practice values
    const practiceSets = practice.sets_attempted ?? practice.total ?? 0
    const practiceAnswered = practice.total_answered ?? 0
    const practiceCorrect = practice.correct_answers ?? 0
    const practiceAvg = practiceAnswered > 0 ? Math.round((practiceCorrect / practiceAnswered) * 100) : 0

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {data?.user?.name || user?.firstName || user?.name || 'Student'} 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Here's a summary of your learning activity.
                </p>
            </div>

            {/* Quiz Stats */}
            <div>
                <SectionTitle title="Quiz Overview" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={TbClipboardCheck} label="Total Attempts" value={quizTotal} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
                    <StatCard icon={TbCheck} label="Completed" value={quizCompleted} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                    <StatCard icon={TbTrophy} label="Avg Score" value={`${quizAvg}%`} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20" />
                    <StatCard icon={TbClock} label="In Progress" value={quizInProgress} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
                </div>
            </div>

            {/* Practice Stats */}
            <div>
                <SectionTitle title="Practice Sets Overview" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={TbPencil} label="Sets Attempted" value={practiceSets} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-900/20" />
                    <StatCard icon={TbClipboardCheck} label="Questions Answered" value={practiceAnswered} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/20" />
                    <StatCard icon={TbCheck} label="Correct Answers" value={practiceCorrect} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                    <StatCard icon={TbChartBar} label="Accuracy" value={`${practiceAvg}%`} color="text-orange-600" bg="bg-orange-50 dark:bg-orange-900/20" />
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
                                {recentAttempts.map((a) => (
                                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                        <td className="px-5 py-3">
                                            <div className="font-medium text-gray-800 dark:text-gray-200">
                                                {a.quiz?.title ?? a.title ?? a.quiz_title ?? '—'}
                                            </div>
                                            {a.quiz?.type && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block ${a.quiz.type === 'exam' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {a.quiz.type}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                                            {a.percentage != null ? `${Number(a.percentage).toFixed(1)}%` : a.score != null ? `${a.score}%` : '—'}
                                            {a.final_score != null && (
                                                <div className="text-xs text-gray-400">{Number(a.final_score).toFixed(1)} marks</div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3">
                                            <StatusBadge status={a.is_passed ? 'passed' : a.status} />
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                                            {(a.submitted_at ?? a.created_at) ? new Date(a.submitted_at ?? a.created_at).toLocaleDateString() : '—'}
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

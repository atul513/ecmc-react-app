import { useEffect, useState } from 'react'
import { apiGetParentDashboard } from '@/services/DashboardService'
import { useSessionUser } from '@/store/authStore'
import {
    TbLoader, TbUsers, TbClipboardCheck, TbChartBar,
    TbCreditCard, TbTrophy, TbCalendar, TbAlertCircle,
    TbCircleCheck, TbClock,
} from 'react-icons/tb'

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

const ChildCard = ({ child }) => {
    const stats = child.stats ?? {}
    const subscription = child.subscription ?? null
    const recentResults = child.recent_quiz_results ?? child.quiz_results ?? []

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Child header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {(child.name ?? child.first_name ?? '?')[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {child.name ?? `${child.first_name ?? ''} ${child.last_name ?? ''}`.trim()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{child.email}</p>
                    </div>
                </div>
                {subscription && <StatusBadge status={subscription.status} />}
            </div>

            <div className="p-6 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: TbClipboardCheck, label: 'Quizzes', value: stats.total_quizzes, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                        { icon: TbCircleCheck,    label: 'Completed', value: stats.completed_quizzes, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { icon: TbTrophy,         label: 'Avg Score', value: stats.avg_score != null ? `${stats.avg_score}%` : '—', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { icon: TbClock,          label: 'In Progress', value: stats.in_progress, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    ].map(({ icon: Icon, label, value, color, bg }, i) => (
                        <div key={i} className={`rounded-xl ${bg} p-3 flex items-center gap-3`}>
                            <Icon className={`text-xl ${color} shrink-0`} />
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
                                <p className="text-xs text-gray-500">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subscription info */}
                {subscription && (
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl px-4 py-3">
                        <TbCreditCard className="text-xl text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{subscription.plan_name ?? 'Plan'}</p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                <TbCalendar className="text-sm" />
                                Expires: {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : '—'}
                                {subscription.days_remaining != null && (
                                    <span className={`ml-1 px-2 py-0.5 rounded-full font-medium ${subscription.days_remaining <= 7 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {subscription.days_remaining}d left
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Quiz Results */}
                {recentResults.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Recent Quiz Results</p>
                        <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Quiz</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Score</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Status</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {recentResults.slice(0, 5).map((r, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                            <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{r.quiz_title ?? r.title ?? '—'}</td>
                                            <td className="px-4 py-2.5 text-gray-600 dark:text-gray-300">{r.score != null ? `${r.score}%` : '—'}</td>
                                            <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                                            <td className="px-4 py-2.5 text-gray-400 text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
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

// ─── Main Component ────────────────────────────────────────────────────────────
const ParentDashboard = () => {
    const user = useSessionUser((s) => s.user)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        apiGetParentDashboard()
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

    const children = data?.children ?? (Array.isArray(data) ? data : [])

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome, {user?.firstName || user?.name || 'Parent'} 👨‍👩‍👧
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Monitor your children's learning progress and subscription status.
                </p>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <TbUsers className="text-2xl text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{children.length}</p>
                        <p className="text-sm text-gray-500">Children</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <TbCreditCard className="text-2xl text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {children.filter((c) => c.subscription?.status === 'active').length}
                        </p>
                        <p className="text-sm text-gray-500">Active Subscriptions</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                        <TbChartBar className="text-2xl text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {children.length > 0
                                ? Math.round(children.reduce((acc, c) => acc + (c.stats?.avg_score ?? 0), 0) / children.length)
                                : '—'}
                            {children.length > 0 ? '%' : ''}
                        </p>
                        <p className="text-sm text-gray-500">Overall Avg Score</p>
                    </div>
                </div>
            </div>

            {/* Per-child cards */}
            {children.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    No children linked to your account yet.
                </div>
            ) : (
                <div className="space-y-6">
                    <SectionTitle title="Children Overview" />
                    {children.map((child, i) => (
                        <ChildCard key={child.id ?? i} child={child} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default ParentDashboard

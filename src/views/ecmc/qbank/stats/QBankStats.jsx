import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { apiGetQBankStats } from '@/services/QBankService'
import {
    TbBook, TbCircleCheck, TbClock, TbAlertCircle, TbPlus,
    TbUpload, TbFileImport, TbCalendar, TbCheck, TbX,
} from 'react-icons/tb'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="text-2xl text-white" />
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        </div>
    </div>
)

const objToRows = (obj) => {
    if (!obj || typeof obj !== 'object') return []
    return Object.entries(obj).map(([key, count]) => ({ key, count }))
}

const BAR_COLORS = {
    easy: 'bg-emerald-500', medium: 'bg-amber-500', hard: 'bg-red-500',
    mcq: 'bg-blue-500', multi_select: 'bg-violet-500', true_false: 'bg-teal-500',
    short_answer: 'bg-cyan-500', long_answer: 'bg-indigo-500', fill_blank: 'bg-orange-500', match_column: 'bg-pink-500',
    draft: 'bg-gray-400', approved: 'bg-emerald-500', in_review: 'bg-amber-500', rejected: 'bg-red-500',
}

const IMPORT_STATUS = {
    completed: { cls: 'bg-emerald-100 text-emerald-700', icon: TbCheck },
    failed: { cls: 'bg-red-100 text-red-600', icon: TbX },
    processing: { cls: 'bg-amber-100 text-amber-700', icon: TbClock },
}

const QBankStats = () => {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiGetQBankStats()
            .then((res) => setData(res?.data || res || {}))
            .catch((e) => { console.error(e); setData({}) })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center py-20"><Spinner size="40px" /></div>
            </Container>
        )
    }

    const total = data?.total ?? 0
    const byStatus = data?.by_status ?? {}
    const thisMonth = data?.this_month ?? 0
    const recentImports = data?.recent_imports ?? []

    const statCards = [
        { icon: TbBook, label: 'Total Questions', value: total, color: 'bg-blue-500' },
        { icon: TbCircleCheck, label: 'Approved', value: byStatus.approved ?? 0, color: 'bg-emerald-500' },
        { icon: TbClock, label: 'In Review', value: byStatus.in_review ?? 0, color: 'bg-amber-500' },
        { icon: TbAlertCircle, label: 'Draft', value: byStatus.draft ?? 0, color: 'bg-gray-500' },
        { icon: TbCalendar, label: 'This Month', value: thisMonth, color: 'bg-purple-500' },
        { icon: TbBook, label: 'Subjects', value: objToRows(data?.by_subject).length, color: 'bg-indigo-500' },
    ]

    const typeRows = objToRows(data?.by_type)
    const diffRows = objToRows(data?.by_difficulty)
    const subjectRows = objToRows(data?.by_subject)

    return (
        <Container>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h3 className="text-xl font-semibold">Question Bank Dashboard</h3>
                    <div className="flex gap-2">
                        <Button
                            variant="solid"
                            icon={<TbPlus />}
                            onClick={() => navigate(`${ECMC_PREFIX_PATH}/qbank/questions/create`)}
                        >
                            Add Question
                        </Button>
                        <Button
                            icon={<TbUpload />}
                            onClick={() => navigate(`${ECMC_PREFIX_PATH}/qbank/import`)}
                        >
                            Import
                        </Button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statCards.map((c) => (
                        <StatCard key={c.label} {...c} />
                    ))}
                </div>

                {/* Breakdowns */}
                <AdaptiveCard>
                    <h5 className="font-semibold mb-6">Breakdown</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* By Type */}
                        <div>
                            <p className="font-medium mb-3 text-gray-700 dark:text-gray-300">By Question Type</p>
                            {typeRows.length === 0 ? (
                                <p className="text-sm text-gray-400">No data</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {typeRows.map((row) => (
                                        <div key={row.key} className="flex items-center gap-3">
                                            <span className="text-sm w-28 capitalize text-gray-600 dark:text-gray-400">
                                                {row.key.replace(/_/g, ' ')}
                                            </span>
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`${BAR_COLORS[row.key] || 'bg-blue-500'} h-2 rounded-full transition-all`}
                                                    style={{ width: `${Math.min(100, (row.count / (total || 1)) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-8 text-right">{row.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* By Difficulty */}
                        <div>
                            <p className="font-medium mb-3 text-gray-700 dark:text-gray-300">By Difficulty</p>
                            {diffRows.length === 0 ? (
                                <p className="text-sm text-gray-400">No data</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {diffRows.map((row) => (
                                        <div key={row.key} className="flex items-center gap-3">
                                            <span className="text-sm w-16 capitalize text-gray-600 dark:text-gray-400">{row.key}</span>
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`${BAR_COLORS[row.key] || 'bg-blue-500'} h-2 rounded-full transition-all`}
                                                    style={{ width: `${Math.min(100, (row.count / (total || 1)) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-8 text-right">{row.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* By Subject */}
                        <div>
                            <p className="font-medium mb-3 text-gray-700 dark:text-gray-300">By Subject</p>
                            {subjectRows.length === 0 ? (
                                <p className="text-sm text-gray-400">No data</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {subjectRows.map((row) => (
                                        <div key={row.key} className="flex items-center gap-3">
                                            <span className="text-sm w-28 text-gray-600 dark:text-gray-400 truncate" title={row.key}>{row.key}</span>
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, (row.count / (total || 1)) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-8 text-right">{row.count}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>

                {/* Recent Imports */}
                {recentImports.length > 0 && (
                    <AdaptiveCard>
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="font-semibold">Recent Imports</h5>
                            <Button
                                size="xs"
                                icon={<TbFileImport />}
                                onClick={() => navigate(`${ECMC_PREFIX_PATH}/qbank/import`)}
                            >
                                View All
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                        <th className="text-left px-4 py-2.5 font-medium text-gray-500">File</th>
                                        <th className="text-center px-4 py-2.5 font-medium text-gray-500">Status</th>
                                        <th className="text-center px-4 py-2.5 font-medium text-gray-500">Imported</th>
                                        <th className="text-center px-4 py-2.5 font-medium text-gray-500">Errors</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-gray-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {recentImports.map((imp) => {
                                        const st = IMPORT_STATUS[imp.status] || IMPORT_STATUS.processing
                                        const StIcon = st.icon
                                        return (
                                            <tr key={imp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">{imp.file_name}</div>
                                                    {imp.summary?.dry_run && (
                                                        <span className="text-xs text-amber-600 font-medium">Dry Run</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
                                                        <StIcon size={14} /> {imp.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-medium text-emerald-600">
                                                    {imp.success_count ?? imp.imported ?? 0}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {(imp.error_count || 0) > 0
                                                        ? <span className="font-medium text-red-500">{imp.error_count}</span>
                                                        : <span className="text-gray-400">0</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                                    {imp.created_at ? new Date(imp.created_at).toLocaleString() : '—'}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </AdaptiveCard>
                )}
            </div>
        </Container>
    )
}

export default QBankStats

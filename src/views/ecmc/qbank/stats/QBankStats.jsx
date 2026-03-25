import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import { apiGetQBankStats, apiGetQBankAggregations, apiGetSubjects } from '@/services/QBankService'
import { TbBook, TbTag, TbList, TbCircleCheck, TbClock, TbAlertCircle, TbPlus, TbUpload } from 'react-icons/tb'
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

const QBankStats = () => {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [agg, setAgg] = useState(null)
    const [subjects, setSubjects] = useState([])
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadAll = async () => {
            try {
                const [statsRes, subjectsRes] = await Promise.all([
                    apiGetQBankStats(),
                    apiGetSubjects({ active_only: true }),
                ])
                setStats(statsRes?.data || statsRes)
                setSubjects(
                    (subjectsRes?.data || []).map((s) => ({ value: s.id, label: s.name }))
                )
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        loadAll()
    }, [])

    useEffect(() => {
        const loadAgg = async () => {
            try {
                const params = selectedSubject ? { subject_id: selectedSubject } : {}
                const res = await apiGetQBankAggregations(params)
                setAgg(res?.data || res)
            } catch (e) {
                console.error(e)
            }
        }
        loadAgg()
    }, [selectedSubject])

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center py-20">
                    <Spinner size="40px" />
                </div>
            </Container>
        )
    }

    const statCards = [
        { icon: TbBook, label: 'Total Questions', value: stats?.total_questions, color: 'bg-blue-500' },
        { icon: TbCircleCheck, label: 'Approved', value: stats?.approved_count, color: 'bg-emerald-500' },
        { icon: TbClock, label: 'In Review', value: stats?.review_count, color: 'bg-amber-500' },
        { icon: TbAlertCircle, label: 'Draft', value: stats?.draft_count, color: 'bg-gray-500' },
        { icon: TbList, label: 'Subjects', value: stats?.subjects_count, color: 'bg-purple-500' },
        { icon: TbTag, label: 'Tags', value: stats?.tags_count, color: 'bg-pink-500' },
    ]

    const typeRows = agg?.by_type || []
    const diffRows = agg?.by_difficulty || []

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

                {/* Aggregations */}
                <AdaptiveCard>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                        <h5 className="font-semibold">Breakdown</h5>
                        <div className="w-56">
                            <Select
                                placeholder="All Subjects"
                                options={subjects}
                                isClearable
                                onChange={(opt) => setSelectedSubject(opt?.value || null)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* By Type */}
                        <div>
                            <p className="font-medium mb-3 text-gray-700 dark:text-gray-300">By Question Type</p>
                            {typeRows.length === 0 ? (
                                <p className="text-sm text-gray-400">No data</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {typeRows.map((row) => (
                                        <div key={row.type} className="flex items-center gap-3">
                                            <span className="text-sm w-32 capitalize text-gray-600 dark:text-gray-400">
                                                {row.type?.replace(/_/g, ' ')}
                                            </span>
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${Math.min(100, (row.count / (stats?.total_questions || 1)) * 100)}%` }}
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
                                    {diffRows.map((row) => {
                                        const colors = { easy: 'bg-emerald-500', medium: 'bg-amber-500', hard: 'bg-orange-500', expert: 'bg-red-500' }
                                        return (
                                            <div key={row.difficulty} className="flex items-center gap-3">
                                                <span className="text-sm w-16 capitalize text-gray-600 dark:text-gray-400">{row.difficulty}</span>
                                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className={`${colors[row.difficulty] || 'bg-blue-500'} h-2 rounded-full`}
                                                        style={{ width: `${Math.min(100, (row.count / (stats?.total_questions || 1)) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium w-8 text-right">{row.count}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </AdaptiveCard>
            </div>
        </Container>
    )
}

export default QBankStats

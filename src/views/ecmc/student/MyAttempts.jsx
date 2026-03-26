import { useEffect, useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Input from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import { apiGetMyAttempts, apiGetAttemptResult } from '@/services/QuizService'
import Dialog from '@/components/ui/Dialog'
import { TbSearch, TbEye, TbTrophy, TbClock, TbCheck, TbX } from 'react-icons/tb'

const { THead, TBody, Tr, Th, Td } = Table

const statusBadge = (status) => {
    const map = {
        completed: { cls: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
        in_progress: { cls: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
        timed_out: { cls: 'bg-red-100 text-red-700', label: 'Timed Out' },
        abandoned: { cls: 'bg-gray-100 text-gray-500', label: 'Abandoned' },
    }
    const { cls, label } = map[status] ?? { cls: 'bg-gray-100 text-gray-400', label: status }
    return <span className={`text-xs px-2 py-1 rounded-full font-medium ${cls}`}>{label}</span>
}

const ResultDialog = ({ open, result, onClose }) => {
    if (!result) return null
    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={560}>
            <h5 className="font-semibold mb-4">Attempt Result</h5>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600">{result.total_marks_obtained ?? '—'}</div>
                        <div className="text-xs text-gray-500 mt-1">Marks Obtained</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{result.total_marks ?? '—'}</div>
                        <div className="text-xs text-gray-500 mt-1">Total Marks</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {result.percentage != null ? `${result.percentage}%` : '—'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Percentage</div>
                    </div>
                    <div className={`rounded-lg p-4 text-center ${result.passed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        <div className={`text-2xl font-bold ${result.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                            {result.passed == null ? '—' : result.passed ? 'Pass' : 'Fail'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Result</div>
                    </div>
                </div>
                {result.correct_count != null && (
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="rounded bg-gray-50 dark:bg-gray-700 p-2">
                            <div className="font-semibold">{result.correct_count}</div>
                            <div className="text-xs text-gray-400">Correct</div>
                        </div>
                        <div className="rounded bg-gray-50 dark:bg-gray-700 p-2">
                            <div className="font-semibold">{result.incorrect_count ?? '—'}</div>
                            <div className="text-xs text-gray-400">Incorrect</div>
                        </div>
                        <div className="rounded bg-gray-50 dark:bg-gray-700 p-2">
                            <div className="font-semibold">{result.skipped_count ?? '—'}</div>
                            <div className="text-xs text-gray-400">Skipped</div>
                        </div>
                    </div>
                )}
                {result.time_taken_seconds != null && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <TbClock />
                        Time taken: {Math.floor(result.time_taken_seconds / 60)}m {result.time_taken_seconds % 60}s
                    </div>
                )}
            </div>
            <div className="flex justify-end mt-4">
                <Button onClick={onClose}>Close</Button>
            </div>
        </Dialog>
    )
}

const MyAttempts = () => {
    const [attempts, setAttempts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [resultDialog, setResultDialog] = useState({ open: false, result: null, loading: false })

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await apiGetMyAttempts()
                setAttempts(res?.data || [])
            } catch {
                toast.push(<Notification type="danger" title="Failed to load attempts" />, { placement: 'top-center' })
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = attempts.filter((a) =>
        a.quiz?.title?.toLowerCase().includes(search.toLowerCase())
    )

    const viewResult = async (attempt) => {
        setResultDialog({ open: true, result: null, loading: true })
        try {
            const res = await apiGetAttemptResult(attempt.id)
            setResultDialog({ open: true, result: res?.data, loading: false })
        } catch {
            toast.push(<Notification type="danger" title="Could not load result" />, { placement: 'top-center' })
            setResultDialog({ open: false, result: null, loading: false })
        }
    }

    const formatDate = (dt) => dt ? new Date(dt).toLocaleString() : '—'

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold">My Attempts</h3>
                            <p className="text-sm text-gray-500">History of all your quiz attempts</p>
                        </div>
                        <Input
                            prefix={<TbSearch />}
                            placeholder="Search by quiz name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-52"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner size="40px" /></div>
                    ) : (
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Quiz / Exam</Th>
                                    <Th>Type</Th>
                                    <Th>Status</Th>
                                    <Th>Score</Th>
                                    <Th>Percentage</Th>
                                    <Th>Result</Th>
                                    <Th>Started At</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {filtered.length === 0 ? (
                                    <Tr><Td colSpan={9} className="text-center text-gray-400 py-8">No attempts found</Td></Tr>
                                ) : filtered.map((a, idx) => (
                                    <Tr key={a.id}>
                                        <Td className="text-sm text-gray-400">{idx + 1}</Td>
                                        <Td>
                                            <div className="font-medium">{a.quiz?.title ?? '—'}</div>
                                            {a.quiz?.category?.name && (
                                                <div className="text-xs text-gray-400">{a.quiz.category.name}</div>
                                            )}
                                        </Td>
                                        <Td>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.quiz?.type === 'exam' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {a.quiz?.type ?? '—'}
                                            </span>
                                        </Td>
                                        <Td>{statusBadge(a.status)}</Td>
                                        <Td className="text-sm">
                                            {a.total_marks_obtained != null
                                                ? `${a.total_marks_obtained} / ${a.total_marks ?? '?'}`
                                                : '—'}
                                        </Td>
                                        <Td className="text-sm">
                                            {a.percentage != null ? `${a.percentage}%` : '—'}
                                        </Td>
                                        <Td>
                                            {a.status === 'completed' ? (
                                                a.passed == null ? '—' : a.passed ? (
                                                    <span className="text-emerald-600 flex items-center gap-1 text-sm font-medium">
                                                        <TbCheck /> Pass
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 flex items-center gap-1 text-sm font-medium">
                                                        <TbX /> Fail
                                                    </span>
                                                )
                                            ) : '—'}
                                        </Td>
                                        <Td className="text-xs text-gray-500">{formatDate(a.started_at)}</Td>
                                        <Td>
                                            {a.status === 'completed' && (
                                                <Button
                                                    size="xs"
                                                    icon={<TbEye />}
                                                    onClick={() => viewResult(a)}
                                                >
                                                    View
                                                </Button>
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    )}
                </div>
            </AdaptiveCard>

            <ResultDialog
                open={resultDialog.open}
                result={resultDialog.loading ? null : resultDialog.result}
                onClose={() => setResultDialog({ open: false, result: null, loading: false })}
            />
        </Container>
    )
}

export default MyAttempts

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import Dialog from '@/components/ui/Dialog'
import toast from '@/components/ui/toast'
import { apiGetMyQuizzes, apiCheckQuizAccess, apiStartQuiz } from '@/services/QuizService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import {
    TbSearch, TbPlayerPlay, TbLock, TbClock,
    TbListCheck, TbAlertTriangle, TbX,
} from 'react-icons/tb'

const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim()
const DESC_LIMIT = 80

const DescriptionText = ({ html }) => {
    const [expanded, setExpanded] = useState(false)
    const plain = stripHtml(html)
    if (!plain) return null
    const isLong = plain.length > DESC_LIMIT
    return (
        <div className="text-xs text-gray-400 mt-1">
            {isLong && !expanded ? plain.slice(0, DESC_LIMIT) + '…' : plain}
            {isLong && (
                <button
                    type="button"
                    className="ml-1 text-primary underline text-xs"
                    onClick={() => setExpanded((v) => !v)}
                >
                    {expanded ? 'less' : 'more'}
                </button>
            )}
        </div>
    )
}

// ─── Instructions Modal ───────────────────────────────────────────────────────
const InstructionsModal = ({ quiz, onConfirm, onClose, starting }) => {
    if (!quiz) return null

    const hasInstructions = !!(quiz.instructions && stripHtml(quiz.instructions).length > 0)

    const examMeta = [
        quiz.questions_count != null && `${quiz.questions_count} Questions`,
        quiz.total_marks != null && `${quiz.total_marks} Marks`,
        quiz.duration_mode === 'manual' && quiz.total_duration_min != null && `${quiz.total_duration_min} Minutes`,
        quiz.negative_marking && 'Negative Marking',
        quiz.max_attempts != null && `Max ${quiz.max_attempts} Attempt${quiz.max_attempts > 1 ? 's' : ''}`,
        quiz.pass_percentage != null && `Pass: ${quiz.pass_percentage}%`,
    ].filter(Boolean)

    return (
        <Dialog
            isOpen
            onClose={onClose}
            onRequestClose={onClose}
            width={600}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${quiz.type === 'exam' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {quiz.type === 'exam' ? 'Exam' : 'Quiz'}
                        </span>
                        {quiz.category?.name && (
                            <span className="text-xs text-gray-400">{quiz.category.name}</span>
                        )}
                    </div>
                    <h4 className="text-lg font-bold heading-text">{quiz.title}</h4>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-1 shrink-0">
                    <TbX size={20} />
                </button>
            </div>

            {/* Exam meta pills */}
            {examMeta.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {examMeta.map((m) => (
                        <span key={m} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full flex items-center gap-1">
                            {m.includes('Minutes') && <TbClock size={12} />}
                            {m}
                        </span>
                    ))}
                </div>
            )}

            {/* Instructions */}
            {hasInstructions ? (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <TbListCheck className="text-primary text-lg" />
                        <h5 className="font-semibold heading-text text-sm">Instructions</h5>
                    </div>
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-64 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: quiz.instructions }}
                    />
                </div>
            ) : (
                <div className="mb-6 text-sm text-gray-400 italic">No specific instructions provided for this exam.</div>
            )}

            {/* Warning */}
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 mb-6 text-xs text-amber-700 dark:text-amber-400">
                <TbAlertTriangle className="shrink-0 mt-0.5 text-base" />
                <span>Once you start, the timer will begin. Make sure you have a stable internet connection before proceeding.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
                <Button variant="plain" onClick={onClose} disabled={starting}>
                    Cancel
                </Button>
                <Button
                    variant="solid"
                    icon={<TbPlayerPlay />}
                    loading={starting}
                    onClick={onConfirm}
                >
                    {starting ? 'Starting…' : `Start ${quiz.type === 'exam' ? 'Exam' : 'Quiz'}`}
                </Button>
            </div>
        </Dialog>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const MyQuizzes = () => {
    const navigate = useNavigate()
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedQuiz, setSelectedQuiz] = useState(null)  // quiz shown in instructions modal
    const [starting, setStarting] = useState(false)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await apiGetMyQuizzes()
                setQuizzes(res?.data || [])
            } catch {
                toast.push(<Notification type="danger" title="Failed to load quizzes" />, { placement: 'top-center' })
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = quizzes.filter((q) =>
        q.title?.toLowerCase().includes(search.toLowerCase())
    )

    // Step 1: check access → open instructions modal
    const handleOpenInstructions = async (quiz) => {
        try {
            await apiCheckQuizAccess(quiz.id)
            setSelectedQuiz(quiz)
        } catch (err) {
            const msg = err?.response?.data?.message ?? 'Access denied or exam not available'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        }
    }

    // Step 2: student clicked "Start Exam" inside the modal
    const handleConfirmStart = async () => {
        if (!selectedQuiz) return
        setStarting(true)
        try {
            const res = await apiStartQuiz(selectedQuiz.id)
            const attemptId = res?.data?.id ?? res?.data?.attempt_id
            if (attemptId) {
                setSelectedQuiz(null)
                navigate(`${ECMC_PREFIX_PATH}/student/attempt/${attemptId}`)
            } else {
                toast.push(<Notification type="warning" title="Could not start exam" />, { placement: 'top-center' })
            }
        } catch (err) {
            const msg = err?.response?.data?.message ?? 'Failed to start exam'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setStarting(false)
        }
    }

    const formatDuration = (q) => {
        if (q.duration_mode === 'manual') return `${q.total_duration_min} min`
        return 'No limit'
    }

    return (
        <Container>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold">My Exams</h3>
                        <p className="text-sm text-gray-500">Available quizzes and exams for you</p>
                    </div>
                    <Input
                        prefix={<TbSearch />}
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-52"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><Spinner size="40px" /></div>
                ) : filtered.length === 0 ? (
                    <AdaptiveCard>
                        <div className="text-center py-12 text-gray-400">No exams available</div>
                    </AdaptiveCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((quiz) => (
                            <AdaptiveCard key={quiz.id} className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="font-semibold">{quiz.title}</div>
                                        {quiz.description && (
                                            <DescriptionText html={quiz.description} />
                                        )}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${quiz.type === 'exam' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {quiz.type === 'exam' ? 'Exam' : 'Quiz'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <TbClock className="text-base" />
                                        {formatDuration(quiz)}
                                    </span>
                                    {quiz.questions_count != null && (
                                        <span>{quiz.questions_count} questions</span>
                                    )}
                                    {quiz.max_attempts != null && (
                                        <span>Max {quiz.max_attempts} attempt{quiz.max_attempts > 1 ? 's' : ''}</span>
                                    )}
                                    {quiz.access_type === 'paid' && (
                                        <span className="flex items-center gap-1 text-purple-600 font-medium">
                                            <TbLock className="text-base" />
                                            ₹{quiz.price}
                                        </span>
                                    )}
                                </div>

                                {quiz.category?.name && (
                                    <div className="text-xs text-gray-400">{quiz.category.name}</div>
                                )}

                                <div className="mt-auto pt-2">
                                    {quiz.attempts_used != null && quiz.max_attempts != null && (
                                        <div className="text-xs text-gray-400 mb-2">
                                            Attempts used: {quiz.attempts_used} / {quiz.max_attempts}
                                        </div>
                                    )}
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        icon={<TbPlayerPlay />}
                                        className="w-full"
                                        disabled={quiz.access_type === 'paid' && !quiz.has_access}
                                        onClick={() => handleOpenInstructions(quiz)}
                                    >
                                        {quiz.access_type === 'paid' && !quiz.has_access
                                            ? 'Purchase to Access'
                                            : `View & Start`}
                                    </Button>
                                </div>
                            </AdaptiveCard>
                        ))}
                    </div>
                )}
            </div>

            <InstructionsModal
                quiz={selectedQuiz}
                onConfirm={handleConfirmStart}
                onClose={() => setSelectedQuiz(null)}
                starting={starting}
            />
        </Container>
    )
}

export default MyQuizzes

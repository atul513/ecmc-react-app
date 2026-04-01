import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { apiGetMyQuizzes, apiCheckQuizAccess, apiStartQuiz } from '@/services/QuizService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import { TbSearch, TbPlayerPlay, TbLock, TbClock } from 'react-icons/tb'

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

const MyQuizzes = () => {
    const navigate = useNavigate()
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [starting, setStarting] = useState(null)

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

    const handleStart = async (quiz) => {
        setStarting(quiz.id)
        try {
            // Check access first
            await apiCheckQuizAccess(quiz.id)
            const res = await apiStartQuiz(quiz.id)
            const attemptId = res?.data?.id ?? res?.data?.attempt_id
            if (attemptId) {
                navigate(`${ECMC_PREFIX_PATH}/student/attempt/${attemptId}`)
            } else {
                toast.push(<Notification type="warning" title="Could not start quiz" />, { placement: 'top-center' })
            }
        } catch (err) {
            const msg = err?.response?.data?.message ?? 'Access denied or quiz not available'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setStarting(null)
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
                        <h3 className="text-lg font-semibold">My Quizzes</h3>
                        <p className="text-sm text-gray-500">Available quizzes and exams for you</p>
                    </div>
                    <Input
                        prefix={<TbSearch />}
                        placeholder="Search quizzes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-52"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><Spinner size="40px" /></div>
                ) : filtered.length === 0 ? (
                    <AdaptiveCard>
                        <div className="text-center py-12 text-gray-400">No quizzes available</div>
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
                                        {quiz.type}
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
                                        loading={starting === quiz.id}
                                        disabled={quiz.access_type === 'paid' && !quiz.has_access}
                                        onClick={() => handleStart(quiz)}
                                    >
                                        {quiz.access_type === 'paid' && !quiz.has_access ? 'Purchase to Access' : 'Start Quiz'}
                                    </Button>
                                </div>
                            </AdaptiveCard>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    )
}

export default MyQuizzes

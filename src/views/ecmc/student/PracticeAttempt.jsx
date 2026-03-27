import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiStartPracticeSet,
    apiCheckPracticeAnswer,
} from '@/services/PracticeSetService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import {
    TbChevronLeft,
    TbChevronRight,
    TbCheck,
    TbX,
    TbStar,
    TbArrowLeft,
} from 'react-icons/tb'
import 'katex/dist/katex.min.css'

// ─── Question Input ─────────────────────────────────────────────────────────────
// question  = wrapper.question  (the nested question object)
// answer    = current draft answer keyed by wrapper.question_id
// feedback  = check-answer response (null until checked)

const AnsweredBadge = ({ isCorrect }) =>
    isCorrect ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
            <TbCheck className="text-sm" /> Correct
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
            <TbX className="text-sm" /> Incorrect
        </span>
    )

const QuestionInput = ({ question, answer, feedback, onChange }) => {
    const qType = question.type
    const selected = answer?.selected_option_ids || []
    const isChecked = feedback !== null
    const correctIds = feedback?.correct_option_ids || []

    const optionClass = (optId) => {
        if (!isChecked) {
            return selected.includes(optId)
                ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary/40'
        }
        if (correctIds.includes(optId))
            return 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-300'
        if (selected.includes(optId))
            return 'bg-red-50 border-red-400 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60'
    }

    if (['mcq', 'true_false'].includes(qType)) {
        return (
            <div className="space-y-2">
                {question.options?.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        disabled={isChecked}
                        onClick={() => !isChecked && onChange({ selected_option_ids: [opt.id] })}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between gap-2 ${optionClass(opt.id)}`}
                    >
                        <span>{opt.option_text}</span>
                        {isChecked && correctIds.includes(opt.id) && (
                            <TbCheck className="text-green-600 shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        )
    }

    if (qType === 'multi_select') {
        return (
            <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
                {question.options?.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        disabled={isChecked}
                        onClick={() => {
                            if (isChecked) return
                            const cur = answer?.selected_option_ids || []
                            const next = cur.includes(opt.id)
                                ? cur.filter((id) => id !== opt.id)
                                : [...cur, opt.id]
                            onChange({ selected_option_ids: next })
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center gap-3 ${optionClass(opt.id)}`}
                    >
                        <span
                            className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center
                            ${selected.includes(opt.id) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-500'}`}
                        >
                            {selected.includes(opt.id) && <TbCheck className="text-white text-xs" />}
                        </span>
                        <span className="flex-1">{opt.option_text}</span>
                        {isChecked && correctIds.includes(opt.id) && (
                            <TbCheck className="text-green-600 shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        )
    }

    if (['short_answer', 'long_answer'].includes(qType)) {
        return (
            <textarea
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-60"
                rows={qType === 'long_answer' ? 6 : 3}
                placeholder="Type your answer here..."
                disabled={isChecked}
                value={answer?.text_answer || ''}
                onChange={(e) => onChange({ text_answer: e.target.value })}
            />
        )
    }

    if (qType === 'fill_blank') {
        return (
            <div className="space-y-3">
                {question.blanks?.map((blank) => (
                    <div key={blank.blank_number} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 shrink-0">
                            Blank {blank.blank_number}:
                        </span>
                        <input
                            type="text"
                            disabled={isChecked}
                            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                            placeholder="Your answer..."
                            value={answer?.fill_blank_answers?.[blank.blank_number] || ''}
                            onChange={(e) =>
                                onChange({
                                    fill_blank_answers: {
                                        ...(answer?.fill_blank_answers || {}),
                                        [blank.blank_number]: e.target.value,
                                    },
                                })
                            }
                        />
                    </div>
                ))}
            </div>
        )
    }

    if (qType === 'match_column') {
        const columnBOptions =
            question.match_pairs?.map((p) => ({ id: p.id, text: p.column_b_text })) || []
        return (
            <div className="space-y-3">
                {question.match_pairs?.map((pair) => (
                    <div key={pair.id} className="flex items-center gap-3">
                        <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                            {pair.column_a_text}
                        </div>
                        <span className="text-gray-400 shrink-0">→</span>
                        <select
                            disabled={isChecked}
                            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                            value={answer?.match_pairs_answer?.[pair.id] || ''}
                            onChange={(e) =>
                                onChange({
                                    match_pairs_answer: {
                                        ...(answer?.match_pairs_answer || {}),
                                        [pair.id]: e.target.value,
                                    },
                                })
                            }
                        >
                            <option value="">-- Select --</option>
                            {columnBOptions.map((opt) => (
                                <option key={opt.id} value={String(opt.id)}>
                                    {opt.text}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="text-gray-400 text-sm italic">
            Unsupported question type: {qType}
        </div>
    )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const PracticeAttempt = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [practiceSet, setPracticeSet] = useState(null)
    // wrappers: [ { id, question_id, question: { type, question_text, options, ... } } ]
    const [wrappers, setWrappers] = useState([])
    const [currentIdx, setCurrentIdx] = useState(0)
    // answers and feedbacks keyed by wrapper.question_id
    const [answers, setAnswers] = useState({})
    const [feedbacks, setFeedbacks] = useState({})
    const [checking, setChecking] = useState(false)
    const [loading, setLoading] = useState(true)
    const [pointsPopup, setPointsPopup] = useState(null)
    const [totalPoints, setTotalPoints] = useState(0)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiStartPracticeSet(id)
                const data = res?.data
                setPracticeSet(data?.practice_set)
                setWrappers(data?.questions || [])
                const earned = data?.summary?.total_points || data?.summary?.points_earned || 0
                setTotalPoints(earned)
            } catch {
                toast.push(
                    <Notification type="danger" title="Failed to load practice set" />,
                    { placement: 'top-center' },
                )
                navigate(`${ECMC_PREFIX_PATH}/student/my-practice-sets`)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id, navigate])

    // current wrapper and its nested question
    const wrapper = wrappers[currentIdx]
    const question = wrapper?.question
    const qKey = wrapper?.question_id  // key used for answers/feedbacks maps
    const currentAnswer = answers[qKey]
    const currentFeedback = feedbacks[qKey] ?? null

    const hasAnswer = useCallback((q, ans) => {
        if (!q || !ans) return false
        const qType = q.type
        if (['mcq', 'multi_select', 'true_false'].includes(qType))
            return (ans.selected_option_ids?.length || 0) > 0
        if (['short_answer', 'long_answer'].includes(qType))
            return (ans.text_answer || '').trim().length > 0
        if (qType === 'fill_blank')
            return Object.keys(ans.fill_blank_answers || {}).length > 0
        if (qType === 'match_column')
            return Object.keys(ans.match_pairs_answer || {}).length > 0
        return false
    }, [])

    const handleCheck = async () => {
        if (!currentAnswer || !hasAnswer(question, currentAnswer)) {
            toast.push(
                <Notification type="warning" title="Please select / enter an answer first" />,
                { placement: 'top-center' },
            )
            return
        }
        setChecking(true)
        try {
            const payload = { question_id: wrapper.question_id, ...currentAnswer }
            const res = await apiCheckPracticeAnswer(id, payload)
            const fb = res?.data
            setFeedbacks((prev) => ({ ...prev, [qKey]: fb }))
            const pts = fb?.points_earned || 0
            if (pts > 0) setTotalPoints((p) => p + pts)
            if (fb?.show_popup && pts > 0) {
                setPointsPopup(pts)
                setTimeout(() => setPointsPopup(null), 2500)
            }
        } catch {
            toast.push(
                <Notification type="danger" title="Failed to check answer" />,
                { placement: 'top-center' },
            )
        } finally {
            setChecking(false)
        }
    }

    const checkedCount = Object.keys(feedbacks).length
    const allChecked = wrappers.length > 0 && wrappers.every((w) => feedbacks[w.question_id] !== undefined)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size="40px" />
            </div>
        )
    }

    // ── Completed Screen ──────────────────────────────────────────────────────
    if (allChecked && wrappers.length > 0) {
        const correctCount = Object.values(feedbacks).filter((f) => f?.is_correct).length
        const pct = Math.round((correctCount / wrappers.length) * 100)

        return (
            <Container>
                <div className="max-w-lg mx-auto text-center py-16">
                    <div className="text-6xl mb-4">{pct >= 60 ? '🎉' : '📋'}</div>
                    <h2 className="text-2xl font-bold mb-1">Practice Complete!</h2>
                    <p className="text-gray-400 text-sm mb-6">{practiceSet?.title}</p>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md text-left space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Questions</span>
                            <span className="font-semibold">{wrappers.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Correct</span>
                            <span className="font-semibold text-green-600">{correctCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Incorrect</span>
                            <span className="font-semibold text-red-500">
                                {wrappers.length - correctCount}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Score</span>
                            <span className="font-semibold">{pct}%</span>
                        </div>
                        {totalPoints > 0 && (
                            <>
                                <hr className="dark:border-gray-600" />
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Reward Points Earned</span>
                                    <span className="font-bold text-amber-600 flex items-center gap-1">
                                        <TbStar /> {totalPoints}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3 mt-8 justify-center">
                        <Button
                            onClick={() =>
                                navigate(`${ECMC_PREFIX_PATH}/student/my-practice-sets`)
                            }
                        >
                            Back to Practice Sets
                        </Button>
                        <Button
                            variant="solid"
                            onClick={() => {
                                setAnswers({})
                                setFeedbacks({})
                                setTotalPoints(0)
                                setCurrentIdx(0)
                            }}
                        >
                            Retry Practice
                        </Button>
                    </div>
                </div>
            </Container>
        )
    }

    // ── Practice Screen ────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow px-4 py-3 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 truncate">
                    <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
                        onClick={() =>
                            navigate(`${ECMC_PREFIX_PATH}/student/my-practice-sets`)
                        }
                    >
                        <TbArrowLeft size={20} />
                    </button>
                    <span className="font-semibold text-gray-800 dark:text-white truncate">
                        {practiceSet?.title}
                    </span>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-sm text-gray-500">
                    <span>{checkedCount} / {wrappers.length} answered</span>
                    {totalPoints > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                            <TbStar /> {totalPoints} pts
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Question Area */}
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    {wrapper && question && (
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-4">
                                {/* Question meta */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="text-sm font-medium text-gray-400">
                                        Q{currentIdx + 1} of {wrappers.length}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 capitalize">
                                        {question.type?.replace(/_/g, ' ')}
                                    </span>
                                    {question.difficulty && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 capitalize">
                                            {question.difficulty}
                                        </span>
                                    )}
                                    {(wrapper.points_override ?? question.marks) && (
                                        <span className="text-xs text-gray-400">
                                            {wrapper.points_override ?? question.marks} marks
                                        </span>
                                    )}
                                    {currentFeedback && (
                                        <AnsweredBadge isCorrect={currentFeedback.is_correct} />
                                    )}
                                </div>

                                {/* Question text */}
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-full mb-6"
                                    dangerouslySetInnerHTML={{ __html: question.question_text }}
                                />

                                {/* Answer input */}
                                <QuestionInput
                                    question={question}
                                    answer={currentAnswer}
                                    feedback={currentFeedback}
                                    onChange={(val) =>
                                        setAnswers((prev) => ({
                                            ...prev,
                                            [qKey]: { ...(prev[qKey] || {}), ...val },
                                        }))
                                    }
                                />

                                {/* Feedback panel */}
                                {currentFeedback && (
                                    <div
                                        className={`mt-5 rounded-xl p-4 ${
                                            currentFeedback.is_correct
                                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1 font-semibold text-sm">
                                            {currentFeedback.is_correct ? (
                                                <TbCheck className="text-green-600 text-base" />
                                            ) : (
                                                <TbX className="text-red-500 text-base" />
                                            )}
                                            <span
                                                className={
                                                    currentFeedback.is_correct
                                                        ? 'text-green-700 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }
                                            >
                                                {currentFeedback.is_correct ? 'Correct!' : 'Incorrect'}
                                            </span>
                                            {(currentFeedback.points_earned || 0) > 0 && (
                                                <span className="ml-auto flex items-center gap-1 text-xs text-amber-600 font-medium">
                                                    <TbStar />+{currentFeedback.points_earned} pts
                                                </span>
                                            )}
                                        </div>
                                        {currentFeedback.explanation && (
                                            <div
                                                className="text-sm text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-full"
                                                dangerouslySetInnerHTML={{
                                                    __html: currentFeedback.explanation,
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Navigation buttons */}
                                <div className="flex justify-between items-center mt-5">
                                    <Button
                                        icon={<TbChevronLeft />}
                                        disabled={currentIdx === 0}
                                        onClick={() => setCurrentIdx((i) => i - 1)}
                                    >
                                        Previous
                                    </Button>

                                    {!currentFeedback ? (
                                        <Button
                                            variant="solid"
                                            loading={checking}
                                            disabled={!hasAnswer(question, currentAnswer)}
                                            onClick={handleCheck}
                                        >
                                            Check Answer
                                        </Button>
                                    ) : currentIdx < wrappers.length - 1 ? (
                                        <Button
                                            variant="solid"
                                            icon={<TbChevronRight />}
                                            onClick={() => setCurrentIdx((i) => i + 1)}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="solid"
                                            onClick={() => setCurrentIdx(0)}
                                        >
                                            View Summary
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Question Palette Sidebar */}
                <div className="hidden md:flex flex-col w-56 shrink-0 bg-white dark:bg-gray-800 border-l dark:border-gray-700 p-4 overflow-auto">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                        Questions
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {wrappers.map((w, i) => {
                            const fb = feedbacks[w.question_id]
                            const ans = answers[w.question_id]
                            return (
                                <button
                                    key={w.id}
                                    type="button"
                                    onClick={() => setCurrentIdx(i)}
                                    className={`w-9 h-9 rounded text-xs font-medium transition-colors
                                        ${i === currentIdx
                                            ? 'bg-primary text-white'
                                            : fb?.is_correct
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                            : fb !== undefined
                                            ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                                            : ans && hasAnswer(w.question, ans)
                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>
                    <div className="mt-4 space-y-1.5 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-primary inline-block shrink-0" />
                            Current
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/40 inline-block shrink-0" />
                            Correct
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/40 inline-block shrink-0" />
                            Incorrect
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/40 inline-block shrink-0" />
                            Answered
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 inline-block shrink-0" />
                            Not answered
                        </div>
                    </div>
                </div>
            </div>

            {/* Reward Points Popup */}
            {pointsPopup && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce">
                    <div className="bg-amber-500 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2 font-bold text-sm">
                        <TbStar className="text-xl" />
                        +{pointsPopup} points earned!
                    </div>
                </div>
            )}
        </div>
    )
}

export default PracticeAttempt

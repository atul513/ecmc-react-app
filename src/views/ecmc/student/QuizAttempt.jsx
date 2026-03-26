import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiGetAttempt,
    apiSaveAnswer,
    apiSubmitAttempt,
    apiGetAttemptResult,
} from '@/services/QuizService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import { TbChevronLeft, TbChevronRight, TbClock, TbSend, TbCheck } from 'react-icons/tb'
import 'katex/dist/katex.min.css'

// ─── Question Input ────────────────────────────────────────────────────────────
// `wrapper`  = the quiz_question row  { id, question: { type, options, ... } }
// `answer`   = answers[wrapper.id]    { selected_option_ids, text_answer, ... }

const QuestionInput = ({ wrapper, answer, onOptionSelect, onTextChange, onBlankChange, onMatchChange }) => {
    const question = wrapper.question
    const qType = question.type
    const selected = answer?.selected_option_ids || []

    if (['mcq', 'true_false'].includes(qType)) {
        return (
            <div className="space-y-2">
                {question.options?.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => onOptionSelect(wrapper, opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-colors
                            ${selected.includes(opt.id)
                                ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary/40'
                            }`}
                    >
                        {opt.option_text}
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
                        onClick={() => onOptionSelect(wrapper, opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-start gap-3
                            ${selected.includes(opt.id)
                                ? 'bg-primary/10 border-primary dark:bg-primary/20'
                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary/40'
                            }`}
                    >
                        <span className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center
                            ${selected.includes(opt.id) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-500'}`}>
                            {selected.includes(opt.id) && <TbCheck className="text-white text-xs" />}
                        </span>
                        {opt.option_text}
                    </button>
                ))}
            </div>
        )
    }

    if (['short_answer', 'long_answer'].includes(qType)) {
        return (
            <textarea
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                rows={qType === 'long_answer' ? 6 : 3}
                placeholder="Type your answer here..."
                value={answer?.text_answer || ''}
                onChange={(e) => onTextChange(wrapper.id, e.target.value)}
            />
        )
    }

    if (qType === 'fill_blank') {
        return (
            <div className="space-y-3">
                {question.blanks?.map((blank) => (
                    <div key={blank.blank_number} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 shrink-0">Blank {blank.blank_number}:</span>
                        <input
                            type="text"
                            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Your answer..."
                            value={answer?.fill_blank_answers?.find((b) => b.blank_number === blank.blank_number)?.answer || ''}
                            onChange={(e) => onBlankChange(wrapper.id, blank.blank_number, e.target.value)}
                        />
                    </div>
                ))}
            </div>
        )
    }

    if (qType === 'match_column') {
        const columnBOptions = question.match_pairs?.map((p) => ({ id: p.id, text: p.column_b_text })) || []
        return (
            <div className="space-y-3">
                {question.match_pairs?.map((pair) => {
                    const matchAnswer = answer?.match_pairs_answer?.find((m) => m.pair_id === pair.id)
                    return (
                        <div key={pair.id} className="flex items-center gap-3">
                            <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
                                {pair.column_a_text}
                            </div>
                            <span className="text-gray-400 shrink-0">→</span>
                            <select
                                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                value={matchAnswer?.matched_with || ''}
                                onChange={(e) => onMatchChange(wrapper.id, pair.id, e.target.value)}
                            >
                                <option value="">-- Select --</option>
                                {columnBOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.text}</option>
                                ))}
                            </select>
                        </div>
                    )
                })}
            </div>
        )
    }

    return <div className="text-gray-400 text-sm italic">Unsupported question type: {qType}</div>
}

// ─── Main Component ────────────────────────────────────────────────────────────

const QuizAttempt = () => {
    const { attemptId } = useParams()
    const navigate = useNavigate()

    const [attemptData, setAttemptData] = useState(null)   // full data.data
    const [wrappers, setWrappers] = useState([])            // data.questions array
    const [currentIdx, setCurrentIdx] = useState(0)
    const [answers, setAnswers] = useState({})              // keyed by wrapper.id (number)
    const [timeLeft, setTimeLeft] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [result, setResult] = useState(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const textSaveTimers = useRef({})
    const submittedRef = useRef(false)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiGetAttempt(attemptId)
                const data = res?.data   // the `data` envelope

                setAttemptData(data)
                setWrappers(data?.questions || [])

                // Restore saved answers — keyed by wrapper id (number keys in saved_answers)
                const init = {}
                Object.entries(data?.saved_answers || {}).forEach(([key, val]) => {
                    init[Number(key)] = val
                })
                setAnswers(init)

                // Timer: use remaining_seconds from API directly
                if (data?.remaining_seconds != null) {
                    setTimeLeft(Math.max(0, data.remaining_seconds))
                }
            } catch {
                toast.push(<Notification type="danger" title="Failed to load quiz" />, { placement: 'top-center' })
                navigate(`${ECMC_PREFIX_PATH}/student/my-quizzes`)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [attemptId, navigate])

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null) return
        if (timeLeft <= 0) {
            if (!submittedRef.current) {
                submittedRef.current = true
                doSubmit()
            }
            return
        }
        const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
        return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft])

    const doSubmit = useCallback(async () => {
        setSubmitting(true)
        setShowConfirm(false)
        try {
            await apiSubmitAttempt(attemptId)
            try {
                const res = await apiGetAttemptResult(attemptId)
                setResult(res?.data)
            } catch {
                // result may not be immediate
            }
            setSubmitted(true)
        } catch {
            toast.push(<Notification type="danger" title="Failed to submit quiz" />, { placement: 'top-center' })
            submittedRef.current = false
        } finally {
            setSubmitting(false)
        }
    }, [attemptId])

    const handleSubmitClick = () => {
        if (!showConfirm) { setShowConfirm(true); return }
        submittedRef.current = true
        doSubmit()
    }

    const saveAnswer = useCallback(async (wrapperId, payload) => {
        try {
            await apiSaveAnswer(attemptId, { quiz_question_id: wrapperId, ...payload })
        } catch {
            // silently fail — data preserved in local state
        }
    }, [attemptId])

    // MCQ / true_false / multi_select
    const handleOptionSelect = (wrapper, optionId) => {
        const qType = wrapper.question?.type
        const isMulti = qType === 'multi_select'
        const current = answers[wrapper.id]?.selected_option_ids || []
        const selected = isMulti
            ? current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
            : [optionId]
        const payload = { selected_option_ids: selected }
        setAnswers((prev) => ({ ...prev, [wrapper.id]: { ...prev[wrapper.id], ...payload } }))
        saveAnswer(wrapper.id, payload)
    }

    // Short / long answer (debounced)
    const handleTextChange = (wrapperId, text) => {
        setAnswers((prev) => ({ ...prev, [wrapperId]: { ...prev[wrapperId], text_answer: text } }))
        clearTimeout(textSaveTimers.current[wrapperId])
        textSaveTimers.current[wrapperId] = setTimeout(() => {
            saveAnswer(wrapperId, { text_answer: text })
        }, 800)
    }

    // Fill in the blank (debounced)
    const handleBlankChange = (wrapperId, blankNumber, text) => {
        setAnswers((prev) => {
            const current = prev[wrapperId]?.fill_blank_answers || []
            const updated = [...current.filter((b) => b.blank_number !== blankNumber), { blank_number: blankNumber, answer: text }]
            clearTimeout(textSaveTimers.current[`${wrapperId}_${blankNumber}`])
            textSaveTimers.current[`${wrapperId}_${blankNumber}`] = setTimeout(() => {
                saveAnswer(wrapperId, { fill_blank_answers: updated })
            }, 800)
            return { ...prev, [wrapperId]: { ...prev[wrapperId], fill_blank_answers: updated } }
        })
    }

    // Match the column
    const handleMatchChange = (wrapperId, pairId, matchedWith) => {
        setAnswers((prev) => {
            const current = prev[wrapperId]?.match_pairs_answer || []
            const updated = [...current.filter((m) => m.pair_id !== pairId), { pair_id: pairId, matched_with: matchedWith }]
            saveAnswer(wrapperId, { match_pairs_answer: updated })
            return { ...prev, [wrapperId]: { ...prev[wrapperId], match_pairs_answer: updated } }
        })
    }

    const isAnswered = (wrapper) => {
        const a = answers[wrapper.id]
        if (!a) return false
        const qType = wrapper.question?.type
        if (['mcq', 'multi_select', 'true_false'].includes(qType)) return (a.selected_option_ids?.length || 0) > 0
        if (['short_answer', 'long_answer'].includes(qType)) return (a.text_answer || '').trim().length > 0
        if (qType === 'fill_blank') return (a.fill_blank_answers?.length || 0) > 0
        if (qType === 'match_column') return (a.match_pairs_answer?.length || 0) > 0
        return false
    }

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600)
        const m = Math.floor((secs % 3600) / 60)
        const s = secs % 60
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        return `${m}:${String(s).padStart(2, '0')}`
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner size="40px" /></div>
    }

    // ── Result Screen ──────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <Container>
                <div className="max-w-lg mx-auto text-center py-16">
                    <div className="text-6xl mb-4">{result?.passed ? '🎉' : '📋'}</div>
                    <h2 className="text-2xl font-bold mb-1">Quiz Submitted!</h2>
                    <p className="text-gray-400 text-sm mb-6">{attemptData?.quiz?.title}</p>

                    {result ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md text-left space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Score</span>
                                <span className="font-semibold">{result.total_marks_obtained} / {result.total_marks}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Percentage</span>
                                <span className="font-semibold">{Number(result.percentage || 0).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Result</span>
                                <span className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
                                    {result.passed ? 'PASSED' : 'FAILED'}
                                </span>
                            </div>
                            <hr className="dark:border-gray-600" />
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Correct</span><span className="text-green-600 font-medium">{result.correct_count}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Incorrect</span><span className="text-red-500 font-medium">{result.incorrect_count}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Skipped</span><span className="font-medium">{result.skipped_count}</span>
                            </div>
                            {result.time_taken_seconds != null && (
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Time taken</span>
                                    <span className="font-medium">{formatTime(result.time_taken_seconds)}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Your answers have been submitted. Results will be available shortly.</p>
                    )}

                    <Button variant="solid" className="mt-8" onClick={() => navigate(`${ECMC_PREFIX_PATH}/student/my-attempts`)}>
                        View All Attempts
                    </Button>
                </div>
            </Container>
        )
    }

    // ── Attempt Screen ─────────────────────────────────────────────────────────
    const wrapper = wrappers[currentIdx]
    const answeredCount = wrappers.filter(isAnswered).length

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow px-4 py-3 flex items-center justify-between gap-4 shrink-0">
                <div className="font-semibold text-gray-800 dark:text-white truncate">
                    {attemptData?.quiz?.title}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm text-gray-400 hidden sm:block">
                        {answeredCount} / {wrappers.length} answered
                    </span>
                    {timeLeft !== null && (
                        <span className={`flex items-center gap-1 font-mono font-semibold px-3 py-1 rounded-full text-sm
                            ${timeLeft < 300
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                            <TbClock className="text-base" />
                            {formatTime(timeLeft)}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Question Area */}
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    {wrapper && (
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-4">
                                {/* Question meta */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="text-sm font-medium text-gray-400">
                                        Q{currentIdx + 1} of {wrappers.length}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 capitalize">
                                        {wrapper.question?.type?.replace(/_/g, ' ')}
                                    </span>
                                    {(wrapper.marks_override ?? wrapper.question?.marks) != null && (
                                        <span className="text-xs text-gray-400">
                                            {wrapper.marks_override ?? wrapper.question.marks} marks
                                        </span>
                                    )}
                                </div>

                                {/* Question text */}
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-full mb-6"
                                    dangerouslySetInnerHTML={{ __html: wrapper.question?.question_text }}
                                />

                                {/* Answer input */}
                                <QuestionInput
                                    wrapper={wrapper}
                                    answer={answers[wrapper.id]}
                                    onOptionSelect={handleOptionSelect}
                                    onTextChange={handleTextChange}
                                    onBlankChange={handleBlankChange}
                                    onMatchChange={handleMatchChange}
                                />
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between items-center">
                                <Button
                                    icon={<TbChevronLeft />}
                                    disabled={currentIdx === 0}
                                    onClick={() => setCurrentIdx((i) => i - 1)}
                                >
                                    Previous
                                </Button>
                                {currentIdx === wrappers.length - 1 ? (
                                    <Button variant="solid" icon={<TbSend />} loading={submitting} onClick={handleSubmitClick}>
                                        Submit Quiz
                                    </Button>
                                ) : (
                                    <Button variant="solid" icon={<TbChevronRight />} onClick={() => setCurrentIdx((i) => i + 1)}>
                                        Next
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Question Palette Sidebar */}
                <div className="hidden md:flex flex-col w-56 shrink-0 bg-white dark:bg-gray-800 border-l dark:border-gray-700 p-4 overflow-auto">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Questions</div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {wrappers.map((w, i) => (
                            <button
                                key={w.id}
                                type="button"
                                onClick={() => setCurrentIdx(i)}
                                className={`w-9 h-9 rounded text-xs font-medium transition-colors
                                    ${i === currentIdx
                                        ? 'bg-primary text-white'
                                        : isAnswered(w)
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 space-y-1.5 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-primary inline-block shrink-0" />Current
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/40 inline-block shrink-0" />Answered
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 inline-block shrink-0" />Not answered
                        </div>
                    </div>
                    <div className="mt-auto pt-4">
                        <Button variant="solid" size="sm" className="w-full" loading={submitting} onClick={handleSubmitClick}>
                            Submit Quiz
                        </Button>
                    </div>
                </div>
            </div>

            {/* Confirm Submit Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="font-semibold text-lg mb-2">Submit Quiz?</h3>
                        <p className="text-gray-500 text-sm mb-1">
                            You have answered <strong>{answeredCount}</strong> of <strong>{wrappers.length}</strong> questions.
                        </p>
                        {wrappers.length - answeredCount > 0 && (
                            <p className="text-orange-500 text-sm mt-1">
                                {wrappers.length - answeredCount} question(s) left unanswered.
                            </p>
                        )}
                        <div className="flex gap-3 mt-5">
                            <Button className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</Button>
                            <Button variant="solid" className="flex-1" loading={submitting} onClick={() => { submittedRef.current = true; doSubmit() }}>
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default QuizAttempt

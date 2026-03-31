import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
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
import {
    TbChevronLeft,
    TbChevronRight,
    TbClock,
    TbSend,
    TbCheck,
    TbLayoutGrid,
    TbX,
} from 'react-icons/tb'
import 'katex/dist/katex.min.css'

// ─── Option label A B C D ──────────────────────────────────────────────────────
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

// ─── Question Input ────────────────────────────────────────────────────────────
const QuestionInput = ({ wrapper, answer, onOptionSelect, onTextChange, onBlankChange, onMatchChange }) => {
    const question = wrapper.question
    const qType = question.type
    const selected = answer?.selected_option_ids || []

    if (['mcq', 'true_false'].includes(qType)) {
        return (
            <div className="space-y-3">
                {question.options?.map((opt, i) => {
                    const isSelected = selected.includes(opt.id)
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => onOptionSelect(wrapper, opt.id)}
                            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3
                                ${isSelected
                                    ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20 shadow-sm'
                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:bg-primary/5'
                                }`}
                        >
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-500'}`}>
                                {LABELS[i] || i + 1}
                            </span>
                            <span className="text-sm leading-snug">{opt.option_text}</span>
                        </button>
                    )
                })}
            </div>
        )
    }

    if (qType === 'multi_select') {
        return (
            <div className="space-y-3">
                <p className="text-xs text-primary font-medium bg-primary/5 px-3 py-1.5 rounded-lg inline-block">
                    Select all that apply
                </p>
                {question.options?.map((opt, i) => {
                    const isSelected = selected.includes(opt.id)
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => onOptionSelect(wrapper, opt.id)}
                            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3
                                ${isSelected
                                    ? 'bg-primary/10 border-primary dark:bg-primary/20 shadow-sm'
                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:bg-primary/5'
                                }`}
                        >
                            <span className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors
                                ${isSelected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-500'}`}>
                                {isSelected && <TbCheck className="text-white text-xs" />}
                            </span>
                            <span className="text-xs text-gray-400 font-medium w-5 shrink-0">{LABELS[i]}</span>
                            <span className="text-sm leading-snug">{opt.option_text}</span>
                        </button>
                    )
                })}
            </div>
        )
    }

    if (['short_answer', 'long_answer'].includes(qType)) {
        return (
            <textarea
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-4 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                rows={qType === 'long_answer' ? 7 : 4}
                placeholder="Type your answer here..."
                value={answer?.text_answer || ''}
                onChange={(e) => onTextChange(wrapper.id, e.target.value)}
            />
        )
    }

    if (qType === 'fill_blank') {
        return (
            <div className="space-y-3">
                <p className="text-xs text-gray-400 mb-1">Fill in each blank</p>
                {question.blanks?.map((blank) => (
                    <div key={blank.blank_number} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 shrink-0 w-16">
                            Blank {blank.blank_number}
                        </span>
                        <input
                            type="text"
                            className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                            placeholder={`Answer ${blank.blank_number}`}
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
                <p className="text-xs text-gray-400 mb-1">Match each item on the left with the correct option</p>
                {question.match_pairs?.map((pair) => {
                    const matchAnswer = answer?.match_pairs_answer?.find((m) => m.pair_id === pair.id)
                    return (
                        <div key={pair.id} className="flex items-center gap-2">
                            <div className="flex-1 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium">
                                {pair.column_a_text}
                            </div>
                            <span className="text-gray-400 shrink-0 font-bold">→</span>
                            <select
                                className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
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

// ─── Question Palette ──────────────────────────────────────────────────────────
const QuestionPalette = ({ wrappers, currentIdx, isAnswered, onSelect, onSubmit, submitting }) => (
    <div className="flex flex-col h-full">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Question Navigator</p>
        <div className="grid grid-cols-5 gap-1.5 mb-4">
            {wrappers.map((w, i) => (
                <button
                    key={w.id}
                    type="button"
                    onClick={() => onSelect(i)}
                    className={`h-9 rounded-lg text-xs font-bold transition-all
                        ${i === currentIdx
                            ? 'bg-primary text-white shadow-md scale-105'
                            : isAnswered(w)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-300 dark:border-green-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
        <div className="space-y-1.5 text-xs text-gray-400 mb-4">
            <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-primary inline-block" />Current
            </div>
            <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/40 border border-green-300 inline-block" />Answered
            </div>
            <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 inline-block" />Not answered
            </div>
        </div>
        <div className="mt-auto">
            <Button variant="solid" className="w-full" loading={submitting} onClick={onSubmit}
                icon={<TbSend />}>
                Submit Quiz
            </Button>
        </div>
    </div>
)

// ─── Main Component ────────────────────────────────────────────────────────────
const QuizAttempt = () => {
    const { attemptId } = useParams()
    const navigate = useNavigate()

    const [attemptData, setAttemptData] = useState(null)
    const [wrappers, setWrappers] = useState([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [answers, setAnswers] = useState({})
    const [timeLeft, setTimeLeft] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [result, setResult] = useState(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showPalette, setShowPalette] = useState(false)
    const textSaveTimers = useRef({})
    const submittedRef = useRef(false)

    // Block text selection, copy, cut on the exam screen
    useEffect(() => {
        const blockKeys = (e) => {
            if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a'].includes(e.key.toLowerCase())) {
                // Allow inside textareas / inputs (students need to type)
                const tag = e.target?.tagName
                if (tag === 'TEXTAREA' || tag === 'INPUT') return
                e.preventDefault()
            }
        }
        const blockCopy = (e) => {
            const tag = e.target?.tagName
            if (tag === 'TEXTAREA' || tag === 'INPUT') return
            e.preventDefault()
        }
        const blockContext = (e) => e.preventDefault()

        document.addEventListener('keydown', blockKeys)
        document.addEventListener('copy', blockCopy)
        document.addEventListener('cut', blockCopy)
        document.addEventListener('contextmenu', blockContext)
        return () => {
            document.removeEventListener('keydown', blockKeys)
            document.removeEventListener('copy', blockCopy)
            document.removeEventListener('cut', blockCopy)
            document.removeEventListener('contextmenu', blockContext)
        }
    }, [])

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiGetAttempt(attemptId)
                const data = res?.data
                setAttemptData(data)
                setWrappers(data?.questions || [])
                const init = {}
                Object.entries(data?.saved_answers || {}).forEach(([key, val]) => {
                    init[Number(key)] = val
                })
                setAnswers(init)
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

    useEffect(() => {
        if (timeLeft === null) return
        if (timeLeft <= 0) {
            if (!submittedRef.current) { submittedRef.current = true; doSubmit() }
            return
        }
        const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
        return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft])

    const doSubmit = useCallback(async () => {
        setSubmitting(true)
        setShowConfirm(false)
        setShowPalette(false)
        try {
            await apiSubmitAttempt(attemptId)
            try {
                const res = await apiGetAttemptResult(attemptId)
                setResult(res?.data)
            } catch { /* result may not be immediate */ }
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
        } catch { /* silent */ }
    }, [attemptId])

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

    const handleTextChange = (wrapperId, text) => {
        setAnswers((prev) => ({ ...prev, [wrapperId]: { ...prev[wrapperId], text_answer: text } }))
        clearTimeout(textSaveTimers.current[wrapperId])
        textSaveTimers.current[wrapperId] = setTimeout(() => saveAnswer(wrapperId, { text_answer: text }), 800)
    }

    const handleBlankChange = (wrapperId, blankNumber, text) => {
        setAnswers((prev) => {
            const current = prev[wrapperId]?.fill_blank_answers || []
            const updated = [...current.filter((b) => b.blank_number !== blankNumber), { blank_number: blankNumber, answer: text }]
            clearTimeout(textSaveTimers.current[`${wrapperId}_${blankNumber}`])
            textSaveTimers.current[`${wrapperId}_${blankNumber}`] = setTimeout(() => saveAnswer(wrapperId, { fill_blank_answers: updated }), 800)
            return { ...prev, [wrapperId]: { ...prev[wrapperId], fill_blank_answers: updated } }
        })
    }

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
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-3">
                <Spinner size="40px" />
                <p className="text-sm text-gray-400">Loading your quiz...</p>
            </div>
        )
    }

    // ── Result Screen ──────────────────────────────────────────────────────────
    if (submitted) {
        const pct = result ? Number(result.percentage || 0).toFixed(1) : null
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-6">
                        <div className="text-7xl mb-4">{result?.passed ? '🎉' : '📋'}</div>
                        <h2 className="text-2xl font-bold mb-1">
                            {result?.passed ? 'Well Done!' : 'Quiz Submitted!'}
                        </h2>
                        <p className="text-gray-400 text-sm">{attemptData?.quiz?.title}</p>
                    </div>

                    {result ? (
                        <>
                            {/* Score ring summary */}
                            <div className={`rounded-2xl p-6 mb-4 text-center ${result.passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                                <div className={`text-5xl font-extrabold mb-1 ${result.passed ? 'text-green-600' : 'text-orange-500'}`}>
                                    {pct}%
                                </div>
                                <div className={`text-sm font-bold uppercase tracking-wide ${result.passed ? 'text-green-600' : 'text-orange-500'}`}>
                                    {result.passed ? 'PASSED' : 'FAILED'}
                                </div>
                                <div className="text-gray-500 text-sm mt-1">
                                    {result.total_marks_obtained} / {result.total_marks} marks
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-green-600">{result.correct_count}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Correct</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-red-500">{result.incorrect_count}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Incorrect</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-gray-400">{result.skipped_count}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Skipped</div>
                                </div>
                            </div>

                            {result.time_taken_seconds != null && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 flex justify-between items-center shadow-sm mb-4">
                                    <span className="text-sm text-gray-500 flex items-center gap-2">
                                        <TbClock /> Time taken
                                    </span>
                                    <span className="font-semibold text-sm">{formatTime(result.time_taken_seconds)}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center text-gray-500 text-sm shadow-sm mb-4">
                            Your answers have been submitted. Results will be available shortly.
                        </div>
                    )}

                    <Button variant="solid" className="w-full" size="lg"
                        onClick={() => navigate(`${ECMC_PREFIX_PATH}/student/my-attempts`)}>
                        View All Attempts
                    </Button>
                </div>
            </div>
        )
    }

    // ── Attempt Screen ─────────────────────────────────────────────────────────
    const wrapper = wrappers[currentIdx]
    const answeredCount = wrappers.filter(isAnswered).length
    const progressPct = wrappers.length ? Math.round((answeredCount / wrappers.length) * 100) : 0
    const isLast = currentIdx === wrappers.length - 1
    const isFirst = currentIdx === 0

    return (
        <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-900" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>

            {/* ── Header ── */}
            <div className="bg-white dark:bg-gray-800 shadow-sm shrink-0">
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                    {/* Title */}
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-800 dark:text-white truncate leading-tight">
                            {attemptData?.quiz?.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                            Q{currentIdx + 1} of {wrappers.length}
                            <span className="mx-1.5">·</span>
                            {answeredCount} answered
                        </div>
                    </div>

                    {/* Timer */}
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-1 font-mono font-bold px-3 py-1.5 rounded-xl text-sm shrink-0
                            ${timeLeft < 300
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                            <TbClock className="text-base" />
                            {formatTime(timeLeft)}
                        </div>
                    )}

                    {/* Palette toggle (mobile) */}
                    <button
                        type="button"
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0"
                        onClick={() => setShowPalette(true)}
                    >
                        <TbLayoutGrid size={18} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-100 dark:bg-gray-700">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* Question area */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-2xl mx-auto px-4 py-5 pb-28 md:pb-6">
                        {wrapper && (
                            <>
                                {/* Question card */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-4">
                                    {/* Meta row */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                            Q{currentIdx + 1}
                                        </span>
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 capitalize font-medium">
                                            {wrapper.question?.type?.replace(/_/g, ' ')}
                                        </span>
                                        {(wrapper.marks_override ?? wrapper.question?.marks) != null && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium">
                                                {wrapper.marks_override ?? wrapper.question?.marks} marks
                                            </span>
                                        )}
                                        {isAnswered(wrapper) && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                                                <TbCheck className="text-sm" /> Answered
                                            </span>
                                        )}
                                    </div>

                                    {/* Question text */}
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-full mb-5 text-base leading-relaxed"
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

                                {/* Desktop navigation */}
                                <div className="hidden md:flex justify-between items-center">
                                    <Button icon={<TbChevronLeft />} disabled={isFirst}
                                        onClick={() => setCurrentIdx((i) => i - 1)}>
                                        Previous
                                    </Button>
                                    {isLast ? (
                                        <Button variant="solid" icon={<TbSend />} loading={submitting} onClick={handleSubmitClick}>
                                            Submit Quiz
                                        </Button>
                                    ) : (
                                        <Button variant="solid" icon={<TbChevronRight />}
                                            onClick={() => setCurrentIdx((i) => i + 1)}>
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop sidebar palette */}
                <div className="hidden md:flex flex-col w-60 shrink-0 bg-white dark:bg-gray-800 border-l dark:border-gray-700 p-4 overflow-y-auto">
                    <QuestionPalette
                        wrappers={wrappers}
                        currentIdx={currentIdx}
                        isAnswered={isAnswered}
                        onSelect={(i) => setCurrentIdx(i)}
                        onSubmit={handleSubmitClick}
                        submitting={submitting}
                    />
                </div>
            </div>

            {/* ── Mobile bottom nav bar ── */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-3 flex items-center gap-3 z-30">
                <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => setCurrentIdx((i) => i - 1)}
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 disabled:opacity-40 shrink-0"
                >
                    <TbChevronLeft size={20} />
                </button>

                <div className="flex-1">
                    {isLast ? (
                        <Button variant="solid" className="w-full" icon={<TbSend />}
                            loading={submitting} onClick={handleSubmitClick}>
                            Submit Quiz
                        </Button>
                    ) : (
                        <Button variant="solid" className="w-full" icon={<TbChevronRight />}
                            onClick={() => setCurrentIdx((i) => i + 1)}>
                            Next Question
                        </Button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setShowPalette(true)}
                    className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 shrink-0 text-gray-600 dark:text-gray-300"
                >
                    <TbLayoutGrid size={18} />
                    <span className="text-[9px] mt-0.5">Questions</span>
                </button>
            </div>

            {/* ── Mobile palette bottom sheet ── */}
            {showPalette && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowPalette(false)} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm">Question Navigator</h3>
                            <button
                                type="button"
                                onClick={() => setShowPalette(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
                            >
                                <TbX size={16} />
                            </button>
                        </div>
                        {/* Stats summary */}
                        <div className="flex gap-3 mb-4 text-xs">
                            <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                                <div className="font-bold text-green-600 text-lg">{answeredCount}</div>
                                <div className="text-green-600">Answered</div>
                            </div>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-3 text-center">
                                <div className="font-bold text-gray-500 text-lg">{wrappers.length - answeredCount}</div>
                                <div className="text-gray-400">Remaining</div>
                            </div>
                        </div>
                        <QuestionPalette
                            wrappers={wrappers}
                            currentIdx={currentIdx}
                            isAnswered={isAnswered}
                            onSelect={(i) => { setCurrentIdx(i); setShowPalette(false) }}
                            onSubmit={handleSubmitClick}
                            submitting={submitting}
                        />
                    </div>
                </div>
            )}

            {/* ── Confirm Submit Dialog ── */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="font-bold text-lg mb-3">Submit Quiz?</h3>
                        <div className="flex gap-3 mb-4">
                            <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                                <div className="font-bold text-green-600 text-xl">{answeredCount}</div>
                                <div className="text-xs text-green-600">Answered</div>
                            </div>
                            <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
                                <div className="font-bold text-orange-500 text-xl">{wrappers.length - answeredCount}</div>
                                <div className="text-xs text-orange-500">Unanswered</div>
                            </div>
                        </div>
                        {wrappers.length - answeredCount > 0 && (
                            <p className="text-sm text-orange-500 mb-4 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-xl">
                                ⚠️ You have {wrappers.length - answeredCount} unanswered question(s). Once submitted, you cannot make changes.
                            </p>
                        )}
                        <div className="flex gap-3">
                            <Button className="flex-1" onClick={() => setShowConfirm(false)}>Go Back</Button>
                            <Button variant="solid" className="flex-1" loading={submitting}
                                onClick={() => { submittedRef.current = true; doSubmit() }}>
                                Submit Now
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default QuizAttempt

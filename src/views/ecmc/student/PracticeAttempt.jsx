import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
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
    TbLayoutGrid,
    TbBulb,
} from 'react-icons/tb'
import MathContent from '@/components/shared/MathContent'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

// ─── Question Input ─────────────────────────────────────────────────────────────
const QuestionInput = ({ question, answer, feedback, onChange }) => {
    const qType = question.type
    const selected = answer?.selected_option_ids || []
    const isChecked = feedback !== null
    const correctIds = feedback?.correct_option_ids || []

    const optionState = (optId) => {
        if (!isChecked) return selected.includes(optId) ? 'selected' : 'default'
        if (correctIds.includes(optId)) return 'correct'
        if (selected.includes(optId)) return 'wrong'
        return 'dim'
    }

    const optionClass = (state) => ({
        selected: 'bg-primary/10 border-primary text-primary dark:bg-primary/20 shadow-sm',
        default:  'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:bg-primary/5',
        correct:  'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600',
        wrong:    'bg-red-50 border-red-400 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600',
        dim:      'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-50',
    })[state]

    if (['mcq', 'true_false'].includes(qType)) {
        return (
            <div className="space-y-3">
                {question.options?.map((opt, i) => {
                    const state = optionState(opt.id)
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            disabled={isChecked}
                            onClick={() => !isChecked && onChange({ selected_option_ids: [opt.id] })}
                            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${optionClass(state)}`}
                        >
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                ${state === 'selected' ? 'bg-primary text-white'
                                : state === 'correct'  ? 'bg-green-500 text-white'
                                : state === 'wrong'    ? 'bg-red-400 text-white'
                                : 'bg-gray-100 dark:bg-gray-600 text-gray-500'}`}>
                                {state === 'correct' ? <TbCheck /> : state === 'wrong' ? <TbX /> : (LABELS[i] || i + 1)}
                            </span>
                            <span className="text-sm leading-snug flex-1">{opt.option_text}</span>
                            {isChecked && correctIds.includes(opt.id) && (
                                <span className="text-xs text-green-600 font-medium shrink-0">✓ Correct</span>
                            )}
                        </button>
                    )
                })}
            </div>
        )
    }

    if (qType === 'multi_select') {
        return (
            <div className="space-y-3">
                <p className="text-xs font-medium text-primary bg-primary/8 px-3 py-1.5 rounded-lg inline-block">
                    Select all that apply
                </p>
                {question.options?.map((opt, i) => {
                    const state = optionState(opt.id)
                    return (
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
                            className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${optionClass(state)}`}
                        >
                            <span className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors
                                ${selected.includes(opt.id) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-500'}`}>
                                {selected.includes(opt.id) && <TbCheck className="text-white text-xs" />}
                            </span>
                            <span className="text-xs text-gray-400 font-medium w-5 shrink-0">{LABELS[i]}</span>
                            <span className="text-sm leading-snug flex-1">{opt.option_text}</span>
                            {isChecked && correctIds.includes(opt.id) && (
                                <span className="text-xs text-green-600 font-medium shrink-0">✓</span>
                            )}
                        </button>
                    )
                })}
            </div>
        )
    }

    if (['short_answer', 'long_answer'].includes(qType)) {
        return (
            <textarea
                className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-4 text-sm focus:outline-none focus:border-primary transition-colors resize-none disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                rows={qType === 'long_answer' ? 7 : 4}
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
                <p className="text-xs text-gray-400 mb-1">Fill in each blank</p>
                {question.blanks?.map((blank) => (
                    <div key={blank.blank_number} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 shrink-0 w-16">
                            Blank {blank.blank_number}
                        </span>
                        <input
                            type="text"
                            disabled={isChecked}
                            className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                            placeholder={`Answer ${blank.blank_number}`}
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
        const columnBOptions = question.match_pairs?.map((p) => ({ id: p.id, text: p.column_b_text })) || []
        return (
            <div className="space-y-3">
                <p className="text-xs text-gray-400 mb-1">Match each item on the left</p>
                {question.match_pairs?.map((pair) => (
                    <div key={pair.id} className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium">
                            {pair.column_a_text}
                        </div>
                        <span className="text-gray-400 shrink-0 font-bold">→</span>
                        <select
                            disabled={isChecked}
                            className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
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
                                <option key={opt.id} value={String(opt.id)}>{opt.text}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        )
    }

    return <div className="text-gray-400 text-sm italic">Unsupported question type: {qType}</div>
}

// ─── Question Palette ──────────────────────────────────────────────────────────
const QuestionPalette = ({ wrappers, currentIdx, feedbacks, answers, hasAnswer, onSelect }) => (
    <>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Question Navigator
        </p>
        <div className="grid grid-cols-5 gap-1.5 mb-4">
            {wrappers.map((w, i) => {
                const fb = feedbacks[w.question_id]
                const ans = answers[w.question_id]
                return (
                    <button
                        key={w.id}
                        type="button"
                        onClick={() => onSelect(i)}
                        className={`h-9 rounded-lg text-xs font-bold transition-all
                            ${i === currentIdx
                                ? 'bg-primary text-white shadow-md scale-105'
                                : fb?.is_correct
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-300 dark:border-green-700'
                                : fb !== undefined
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 border border-red-300 dark:border-red-700'
                                : ans && hasAnswer(w.question, ans)
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                            }`}
                    >
                        {i + 1}
                    </button>
                )
            })}
        </div>
        <div className="space-y-1.5 text-xs text-gray-400">
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-primary inline-block shrink-0" />Current</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-100 border border-green-300 inline-block shrink-0" />Correct</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-100 border border-red-300 inline-block shrink-0" />Incorrect</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-blue-100 inline-block shrink-0" />Answered</div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-700 inline-block shrink-0" />Not answered</div>
        </div>
    </>
)

// ─── Main Component ─────────────────────────────────────────────────────────────
const PracticeAttempt = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [practiceSet, setPracticeSet]   = useState(null)
    const [wrappers, setWrappers]         = useState([])
    const [currentIdx, setCurrentIdx]     = useState(0)
    const [answers, setAnswers]           = useState({})     // keyed by wrapper.question_id
    const [feedbacks, setFeedbacks]       = useState({})     // keyed by wrapper.question_id
    const [checking, setChecking]         = useState(false)
    const [loading, setLoading]           = useState(true)
    const [pointsPopup, setPointsPopup]   = useState(null)
    const [totalPoints, setTotalPoints]   = useState(0)
    const [showPalette, setShowPalette]   = useState(false)

    // Block text selection, copy, cut on the practice screen
    useEffect(() => {
        const blockKeys = (e) => {
            if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a'].includes(e.key.toLowerCase())) {
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
                const res = await apiStartPracticeSet(id)
                const data = res?.data
                setPracticeSet(data?.practice_set)
                setWrappers(data?.questions || [])
                const earned = data?.summary?.total_points || data?.summary?.points_earned || 0
                setTotalPoints(earned)
            } catch {
                toast.push(<Notification type="danger" title="Failed to load practice set" />, { placement: 'top-center' })
                navigate(`${ECMC_PREFIX_PATH}/student/my-practice-sets`)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id, navigate])

    const wrapper  = wrappers[currentIdx]
    const question = wrapper?.question
    const qKey     = wrapper?.question_id
    const currentAnswer   = answers[qKey]
    const currentFeedback = feedbacks[qKey] ?? null

    const hasAnswer = useCallback((q, ans) => {
        if (!q || !ans) return false
        const t = q.type
        if (['mcq', 'multi_select', 'true_false'].includes(t)) return (ans.selected_option_ids?.length || 0) > 0
        if (['short_answer', 'long_answer'].includes(t))        return (ans.text_answer || '').trim().length > 0
        if (t === 'fill_blank')   return Object.keys(ans.fill_blank_answers || {}).length > 0
        if (t === 'match_column') return Object.keys(ans.match_pairs_answer || {}).length > 0
        return false
    }, [])

    const handleCheck = async () => {
        if (!hasAnswer(question, currentAnswer)) {
            toast.push(<Notification type="warning" title="Please answer before checking" />, { placement: 'top-center' })
            return
        }
        setChecking(true)
        try {
            const payload = { question_id: wrapper.question_id, ...currentAnswer }
            const res = await apiCheckPracticeAnswer(id, payload)
            const fb  = res?.data
            setFeedbacks((prev) => ({ ...prev, [qKey]: fb }))
            const pts = fb?.points_earned || 0
            if (pts > 0) {
                setTotalPoints((p) => p + pts)
                if (fb?.show_popup) {
                    setPointsPopup(pts)
                    setTimeout(() => setPointsPopup(null), 2500)
                }
            }
        } catch {
            toast.push(<Notification type="danger" title="Failed to check answer" />, { placement: 'top-center' })
        } finally {
            setChecking(false)
        }
    }

    const checkedCount = Object.keys(feedbacks).length
    const correctCount = Object.values(feedbacks).filter((f) => f?.is_correct).length
    const allChecked   = wrappers.length > 0 && wrappers.every((w) => feedbacks[w.question_id] !== undefined)
    const isFirst      = currentIdx === 0
    const isLast       = currentIdx === wrappers.length - 1
    const progressPct  = wrappers.length ? Math.round((checkedCount / wrappers.length) * 100) : 0

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-3">
                <Spinner size="40px" />
                <p className="text-sm text-gray-400">Loading practice set...</p>
            </div>
        )
    }

    // ── Completed Screen ──────────────────────────────────────────────────────
    if (allChecked && wrappers.length > 0) {
        const pct = Math.round((correctCount / wrappers.length) * 100)
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-6">
                        <div className="text-7xl mb-4">{pct >= 60 ? '🎉' : '📋'}</div>
                        <h2 className="text-2xl font-bold mb-1">
                            {pct >= 60 ? 'Great Work!' : 'Practice Complete!'}
                        </h2>
                        <p className="text-gray-400 text-sm">{practiceSet?.title}</p>
                    </div>

                    {/* Score */}
                    <div className={`rounded-2xl p-6 mb-4 text-center ${pct >= 60 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                        <div className={`text-5xl font-extrabold mb-1 ${pct >= 60 ? 'text-green-600' : 'text-orange-500'}`}>
                            {pct}%
                        </div>
                        <div className="text-gray-500 text-sm">{correctCount} of {wrappers.length} correct</div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                            <div className="text-xs text-gray-400 mt-0.5">Correct</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                            <div className="text-2xl font-bold text-red-500">{wrappers.length - correctCount}</div>
                            <div className="text-xs text-gray-400 mt-0.5">Incorrect</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
                            <div className="text-2xl font-bold text-amber-500">{totalPoints}</div>
                            <div className="text-xs text-gray-400 mt-0.5">Points</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button className="flex-1"
                            onClick={() => navigate(`${ECMC_PREFIX_PATH}/student/my-practice-sets`)}>
                            Back
                        </Button>
                        <Button variant="solid" className="flex-1"
                            onClick={() => { setAnswers({}); setFeedbacks({}); setTotalPoints(0); setCurrentIdx(0) }}>
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // ── Practice Screen ────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-900" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>

            {/* ── Header ── */}
            <div className="bg-white dark:bg-gray-800 shadow-sm shrink-0">
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0"
                        onClick={() => navigate(`${ECMC_PREFIX_PATH}/student/my-practice-sets`)}
                    >
                        <TbArrowLeft size={18} />
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-800 dark:text-white truncate leading-tight">
                            {practiceSet?.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                            Q{currentIdx + 1} of {wrappers.length}
                            <span className="mx-1.5">·</span>
                            {checkedCount} answered
                        </div>
                    </div>

                    {/* Points badge */}
                    {totalPoints > 0 && (
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-3 py-1.5 rounded-xl text-sm font-bold shrink-0">
                            <TbStar /> {totalPoints}
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
                        {wrapper && question && (
                            <>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-4">
                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                            Q{currentIdx + 1}
                                        </span>
                                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 capitalize font-medium">
                                            {question.type?.replace(/_/g, ' ')}
                                        </span>
                                        {(wrapper.points_override ?? question.marks) && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium">
                                                {wrapper.points_override ?? question.marks} marks
                                            </span>
                                        )}
                                        {question.difficulty && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 capitalize font-medium">
                                                {question.difficulty}
                                            </span>
                                        )}
                                        {currentFeedback && (
                                            currentFeedback.is_correct ? (
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                                                    <TbCheck className="text-sm" /> Correct
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-medium flex items-center gap-1">
                                                    <TbX className="text-sm" /> Incorrect
                                                </span>
                                            )
                                        )}
                                    </div>

                                    {/* Question text */}
                                    <MathContent
                                        html={question.question_text}
                                        className="prose prose-sm dark:prose-invert max-w-full mb-5 text-base leading-relaxed"
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
                                        <div className={`mt-5 rounded-2xl p-4 border-2
                                            ${currentFeedback.is_correct
                                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                                                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                                                    ${currentFeedback.is_correct ? 'bg-green-500' : 'bg-red-400'}`}>
                                                    {currentFeedback.is_correct
                                                        ? <TbCheck className="text-white text-sm" />
                                                        : <TbX className="text-white text-sm" />}
                                                </span>
                                                <span className={`font-bold text-sm
                                                    ${currentFeedback.is_correct ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {currentFeedback.is_correct ? 'Correct!' : 'Incorrect'}
                                                </span>
                                                {(currentFeedback.points_earned || 0) > 0 && (
                                                    <span className="ml-auto flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                                                        <TbStar /> +{currentFeedback.points_earned} pts
                                                    </span>
                                                )}
                                            </div>
                                            {currentFeedback.explanation && (
                                                <div className="flex gap-2 mt-1">
                                                    <TbBulb className="text-amber-500 shrink-0 mt-0.5 text-base" />
                                                    <MathContent
                                                        html={currentFeedback.explanation}
                                                        className="text-sm text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Desktop nav buttons */}
                                    <div className="hidden md:flex justify-between items-center mt-5">
                                        <Button icon={<TbChevronLeft />} disabled={isFirst}
                                            onClick={() => setCurrentIdx((i) => i - 1)}>
                                            Previous
                                        </Button>

                                        {!currentFeedback ? (
                                            <Button variant="solid" loading={checking}
                                                disabled={!hasAnswer(question, currentAnswer)}
                                                onClick={handleCheck}>
                                                Check Answer
                                            </Button>
                                        ) : isLast ? (
                                            <Button variant="solid" onClick={() => setCurrentIdx(0)}>
                                                View Summary
                                            </Button>
                                        ) : (
                                            <Button variant="solid" icon={<TbChevronRight />}
                                                onClick={() => setCurrentIdx((i) => i + 1)}>
                                                Next
                                            </Button>
                                        )}
                                    </div>
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
                        feedbacks={feedbacks}
                        answers={answers}
                        hasAnswer={hasAnswer}
                        onSelect={(i) => setCurrentIdx(i)}
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
                    {!currentFeedback ? (
                        <Button variant="solid" className="w-full" loading={checking}
                            disabled={!hasAnswer(question, currentAnswer)}
                            onClick={handleCheck}>
                            Check Answer
                        </Button>
                    ) : isLast ? (
                        <Button variant="solid" className="w-full" onClick={() => setCurrentIdx(0)}>
                            View Summary
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
                            <button type="button" onClick={() => setShowPalette(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                <TbX size={16} />
                            </button>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                                <div className="font-bold text-green-600 text-lg">{correctCount}</div>
                                <div className="text-green-600">Correct</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                                <div className="font-bold text-red-500 text-lg">{checkedCount - correctCount}</div>
                                <div className="text-red-500">Incorrect</div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 text-center">
                                <div className="font-bold text-gray-500 text-lg">{wrappers.length - checkedCount}</div>
                                <div className="text-gray-400">Remaining</div>
                            </div>
                        </div>

                        <QuestionPalette
                            wrappers={wrappers}
                            currentIdx={currentIdx}
                            feedbacks={feedbacks}
                            answers={answers}
                            hasAnswer={hasAnswer}
                            onSelect={(i) => { setCurrentIdx(i); setShowPalette(false) }}
                        />
                    </div>
                </div>
            )}

            {/* ── Reward Points Popup ── */}
            {pointsPopup && (
                <div className="fixed bottom-24 md:bottom-8 right-4 z-50">
                    <div className="bg-amber-500 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-2 font-bold text-sm animate-bounce">
                        <TbStar className="text-xl" />
                        +{pointsPopup} points earned!
                    </div>
                </div>
            )}
        </div>
    )
}

export default PracticeAttempt

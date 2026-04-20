import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { apiGetAttemptReport, apiDownloadAttemptReportPdf } from '@/services/QuizService'
import MathContent from '@/components/shared/MathContent'

import {
    TbArrowLeft, TbDownload, TbCheck, TbX, TbMinus,
    TbClock, TbTrophy, TbChartBar, TbUser,
    TbLoader, TbAlertCircle, TbEye, TbBookmark,
    TbBulb, TbSchool, TbAdjustments, TbStar,
} from 'react-icons/tb'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v, fallback = '—') => (v != null ? v : fallback)
const fmtDate = (d) => {
    if (!d) return '—'
    // If API already returns formatted string (e.g. "01 Apr 2026, 08:46 AM"), use it directly
    const parsed = new Date(d)
    if (isNaN(parsed.getTime())) return d
    return parsed.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}
const fmtTime = (secs) => {
    if (secs == null) return '—'
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
const StatBox = ({ label, value, sub, color = 'text-gray-900 dark:text-white', bg = 'bg-white dark:bg-gray-800' }) => (
    <div className={`${bg} rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center`}>
        <div className={`text-2xl font-extrabold ${color}`}>{fmt(value)}</div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
)

const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            {Icon && <Icon className="text-primary text-lg" />}
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
)

const BreakdownTable = ({ rows, rowLabel }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400 rounded-tl-lg">{rowLabel}</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Total</th>
                    <th className="text-center px-4 py-2.5 font-medium text-emerald-600">Correct</th>
                    <th className="text-center px-4 py-2.5 font-medium text-red-500">Incorrect</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-400">Skipped</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400">Marks</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-500 dark:text-gray-400 rounded-tr-lg">Accuracy</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((row, i) => {
                    const accuracy = row.total > 0 ? ((row.correct / row.total) * 100).toFixed(1) : '—'
                    return (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 capitalize">{row.label}</td>
                            <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{fmt(row.total, 0)}</td>
                            <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{fmt(row.correct, 0)}</td>
                            <td className="px-4 py-3 text-center text-red-500 font-semibold">{fmt(row.incorrect, 0)}</td>
                            <td className="px-4 py-3 text-center text-gray-400">{fmt(row.skipped, 0)}</td>
                            <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{fmt(row.marks)}</td>
                            <td className="px-4 py-3 text-center">
                                {accuracy !== '—'
                                    ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${Number(accuracy) >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{accuracy}%</span>
                                    : <span className="text-gray-400">—</span>}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </div>
)

// ─── Question Status Icon ──────────────────────────────────────────────────────
const QStatusIcon = ({ status }) => {
    if (status === 'correct')   return <TbCheck   className="text-emerald-600 text-lg shrink-0" />
    if (status === 'incorrect') return <TbX       className="text-red-500   text-lg shrink-0" />
    return                              <TbMinus  className="text-gray-400  text-lg shrink-0" />
}

const QStatusBorder = (status) => {
    if (status === 'correct')   return 'border-l-4 border-emerald-400'
    if (status === 'incorrect') return 'border-l-4 border-red-400'
    return 'border-l-4 border-gray-200 dark:border-gray-600'
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

// ─── Single Question Card ─────────────────────────────────────────────────────
const QuestionCard = ({ q, idx }) => {
    const [expanded, setExpanded] = useState(true)
    const status  = q.status ?? (q.is_correct ? 'correct' : q.is_skipped ? 'skipped' : 'incorrect')
    const qData   = q.question ?? q
    const qType   = qData.type

    const renderStudentAnswer = () => {
        const sa = q.student_answer
        if (sa == null || status === 'skipped') return <span className="text-gray-400 italic">Not answered</span>

        // student_answer might be a plain string (e.g. "SELECT")
        if (typeof sa === 'string') return sa

        if (['mcq', 'true_false', 'multi_select'].includes(qType)) {
            // Could be { selected_option_ids: [...] } or { selected_option_id: id }
            const studentIds = sa.selected_option_ids ?? (sa.selected_option_id != null ? [sa.selected_option_id] : [])
            if (!studentIds.length) return <span className="text-gray-400 italic">Not answered</span>
            const opts = qData.options ?? []
            const selected = opts.filter((o) => studentIds.includes(o.id))
            return selected.length
                ? selected.map((o) => o.option_text ?? o.text).join(', ')
                : <span className="text-gray-400 italic">Not answered</span>
        }
        if (['short_answer', 'long_answer'].includes(qType)) {
            return sa.text_answer || sa.answer || <span className="text-gray-400 italic">—</span>
        }
        if (qType === 'fill_blank') {
            const blanks = sa.fill_blank_answers
            if (!blanks) return <span className="text-gray-400 italic">—</span>
            // Could be array or object { "1": "answer1", "2": "answer2" }
            if (Array.isArray(blanks)) {
                return blanks.map((b) => `Blank ${b.blank_number}: ${b.answer}`).join(' | ')
            }
            return Object.entries(blanks).map(([k, v]) => `Blank ${k}: ${v}`).join(' | ')
        }
        if (qType === 'match_column') {
            const pairs = sa.match_pairs_answer
            if (!pairs) return <span className="text-gray-400 italic">—</span>
            const allPairs = qData.match_pairs ?? []
            if (Array.isArray(pairs)) {
                return pairs.map((p) => {
                    const pair = allPairs.find((mp) => mp.id === p.pair_id)
                    const matched = allPairs.find((mp) => mp.id === p.matched_with || String(mp.id) === String(p.matched_with))
                    return `${pair?.column_a_text ?? p.pair_id} → ${matched?.column_b_text ?? p.matched_with}`
                }).join(' | ')
            }
            // Object format: { "pair_id": "matched_id" }
            return Object.entries(pairs).map(([k, v]) => {
                const pair = allPairs.find((mp) => String(mp.id) === k)
                const matched = allPairs.find((mp) => String(mp.id) === v)
                return `${pair?.column_a_text ?? k} → ${matched?.column_b_text ?? v}`
            }).join(' | ')
        }
        return <span className="text-gray-400 italic">—</span>
    }

    const renderCorrectAnswer = () => {
        if (['mcq', 'true_false', 'multi_select'].includes(qType)) {
            const opts = qData.options ?? []
            const correct = opts.filter((o) => o.is_correct)
            if (correct.length) return correct.map((o) => o.option_text ?? o.text).join(', ')
            // Fallback to correct_answer string from API
            if (typeof q.correct_answer === 'string' && q.correct_answer) return q.correct_answer
            return <span className="text-gray-400 italic">—</span>
        }
        // For non-option types, correct_answer comes as a string from the API
        if (typeof q.correct_answer === 'string' && q.correct_answer) {
            return q.correct_answer
        }
        if (['short_answer', 'long_answer'].includes(qType)) {
            return q.correct_answer?.text ?? qData.answer_key ?? <span className="text-gray-400 italic">—</span>
        }
        if (qType === 'fill_blank') {
            const blanks = qData.blanks ?? []
            if (!blanks.length) return <span className="text-gray-400 italic">—</span>
            return blanks.map((b) => `Blank ${b.blank_number}: ${b.correct_answer}`).join(' | ')
        }
        if (qType === 'match_column') {
            const pairs = qData.match_pairs ?? []
            return pairs.map((p) => `${p.column_a_text} → ${p.column_b_text}`).join(' | ')
        }
        return <span className="text-gray-400 italic">—</span>
    }

    const diffColor = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-600' }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${QStatusBorder(status)}`}>
            {/* Question header */}
            <button
                className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/20 transition"
                onClick={() => setExpanded((v) => !v)}
            >
                <div className="flex items-center gap-2 mt-0.5 shrink-0">
                    <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {idx + 1}
                    </span>
                    <QStatusIcon status={status} />
                </div>
                <div className="flex-1 min-w-0">
                    <MathContent
                        html={qData.question_text ?? qData.text ?? '—'}
                        className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug line-clamp-2"
                    />
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {qData.difficulty && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColor[qData.difficulty] ?? 'bg-gray-100 text-gray-500'}`}>
                                {qData.difficulty}
                            </span>
                        )}
                        {(qData.subject?.name ?? qData.subject) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                {qData.subject?.name ?? qData.subject}
                            </span>
                        )}
                        {(qData.topic?.name ?? qData.topic) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                                {qData.topic?.name ?? qData.topic}
                            </span>
                        )}
                        <span className="text-xs text-gray-400 capitalize">{(qType ?? '').replace('_', ' ')}</span>
                    </div>
                </div>
                {/* Marks badge */}
                <div className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl ${
                    status === 'correct'   ? 'bg-emerald-100 text-emerald-700' :
                    status === 'incorrect' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-500'
                }`}>
                    {q.marks_awarded != null ? (q.marks_awarded > 0 ? `+${q.marks_awarded}` : q.marks_awarded) : '—'}
                    <span className="font-normal text-gray-400"> / {q.max_marks ?? qData.marks ?? '?'}</span>
                </div>
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    {/* Options (MCQ/true_false/multi_select) */}
                    {['mcq', 'true_false', 'multi_select'].includes(qType) && qData.options?.length > 0 && (
                        <div className="space-y-2">
                            {qData.options.map((opt, i) => {
                                const sa = q.student_answer
                                const studentIds = (sa && typeof sa === 'object')
                                    ? (sa.selected_option_ids ?? (sa.selected_option_id != null ? [sa.selected_option_id] : []))
                                    : []
                                const isStudentPick = studentIds.includes(opt.id)
                                const isCorrect = opt.is_correct
                                let cls = 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                                if (isCorrect) cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                else if (isStudentPick && !isCorrect) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20'
                                return (
                                    <div key={opt.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${cls}`}>
                                        <span className="w-6 h-6 rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                                            {LABELS[i] ?? i + 1}
                                        </span>
                                        <MathContent html={opt.option_text ?? opt.text} className="text-sm flex-1" />
                                        {isCorrect && <TbCheck className="text-emerald-600 shrink-0" />}
                                        {isStudentPick && !isCorrect && <TbX className="text-red-500 shrink-0" />}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* MCQ answer summary row */}
                    {['mcq', 'true_false', 'multi_select'].includes(qType) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className={`rounded-xl p-4 ${status === 'skipped' ? 'bg-gray-50 dark:bg-gray-700/30' : status === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                <p className="text-xs font-medium text-gray-500 mb-1">Your Answer</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">{renderStudentAnswer()}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                                <p className="text-xs font-medium text-gray-500 mb-1">Correct Answer</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">{renderCorrectAnswer()}</p>
                            </div>
                        </div>
                    )}

                    {/* Answer comparison (non-option types) */}
                    {!['mcq', 'true_false', 'multi_select'].includes(qType) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className={`rounded-xl p-4 ${status === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                <p className="text-xs font-medium text-gray-500 mb-1">Your Answer</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">{renderStudentAnswer()}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                                <p className="text-xs font-medium text-gray-500 mb-1">Correct Answer</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">{renderCorrectAnswer()}</p>
                            </div>
                        </div>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                        {(q.time_spent_sec ?? q.time_spent_seconds) != null && (
                            <span className="flex items-center gap-1.5">
                                <TbClock className="text-sm" />
                                Time: {fmtTime(q.time_spent_sec ?? q.time_spent_seconds)}
                            </span>
                        )}
                        {q.visit_count != null && (
                            <span className="flex items-center gap-1.5">
                                <TbEye className="text-sm" />
                                Visited: {q.visit_count}×
                            </span>
                        )}
                        {(q.is_bookmarked || q.bookmarked) && (
                            <span className="flex items-center gap-1.5 text-amber-500">
                                <TbBookmark className="text-sm" />
                                Bookmarked
                            </span>
                        )}
                        {(q.negative_deducted ?? q.negative_marks_applied) != null && Number(q.negative_deducted ?? q.negative_marks_applied) > 0 && (
                            <span className="flex items-center gap-1.5 text-red-500">
                                Negative: −{q.negative_deducted ?? q.negative_marks_applied}
                            </span>
                        )}
                        {q.negative_marks != null && Number(q.negative_marks) > 0 && (
                            <span className="flex items-center gap-1.5 text-gray-400">
                                (Max negative: −{q.negative_marks})
                            </span>
                        )}
                        {q.grader_feedback && (
                            <span className="text-blue-500 italic">Grader: {q.grader_feedback}</span>
                        )}
                    </div>

                    {/* Explanation */}
                    {(q.explanation ?? qData.explanation) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-2">
                                <TbBulb /> Explanation
                            </div>
                            <MathContent
                                html={q.explanation ?? qData.explanation}
                                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                            />
                        </div>
                    )}

                    {/* Solution approach */}
                    {(q.solution_approach ?? qData.solution_approach) && (
                        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-400 text-xs font-semibold mb-2">
                                <TbStar /> Solution Approach
                            </div>
                            <MathContent
                                html={q.solution_approach ?? qData.solution_approach}
                                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const QuizReport = () => {
    const { attemptId } = useParams()
    const navigate = useNavigate()
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [filter, setFilter] = useState('all') // all | correct | incorrect | skipped

    useEffect(() => {
        apiGetAttemptReport(attemptId)
            .then((res) => setReport(res?.data ?? res))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [attemptId])

    const handleDownloadPdf = async () => {
        setDownloading(true)
        try {
            await apiDownloadAttemptReportPdf(attemptId)
        } catch {
            alert('Failed to download PDF. Please try again.')
        } finally {
            setDownloading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
                <TbLoader className="text-3xl animate-spin" />
                <span>Loading report…</span>
            </div>
        )
    }

    if (error || !report) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
                <TbAlertCircle className="text-4xl text-red-400" />
                <span>Failed to load report. This attempt may still be in progress or you may not have access.</span>
                <button className="text-primary text-sm hover:underline" onClick={() => navigate(-1)}>Go back</button>
            </div>
        )
    }

    const attempt    = report.attempt ?? {}
    const rawScore   = report.score_summary ?? report.score ?? {}
    const score      = {
        total_marks:              rawScore.total_marks,
        total_marks_obtained:     rawScore.marks_obtained ?? rawScore.total_marks_obtained,
        negative_marks_deducted:  rawScore.negative_marks_total ?? rawScore.negative_marks_deducted,
        final_score:              rawScore.final_score,
        percentage:               rawScore.percentage,
        accuracy_percentage:      rawScore.accuracy ?? rawScore.accuracy_percentage,
        correct_count:            rawScore.correct ?? rawScore.correct_count,
        incorrect_count:          rawScore.incorrect ?? rawScore.incorrect_count,
        skipped_count:            rawScore.skipped ?? rawScore.skipped_count,
        time_taken_seconds:       rawScore.time_taken_seconds ?? attempt.time_spent_sec,
        rank:                     rawScore.rank,
        passed:                   rawScore.is_passed ?? rawScore.passed,
    }
    // Breakdowns: API returns objects { "easy": {...} }, convert to arrays
    const rawDiff = report.breakdown_by_difficulty ?? report.difficulty_breakdown
    const diffBreak = rawDiff
        ? (Array.isArray(rawDiff) ? rawDiff : Object.entries(rawDiff).map(([key, val]) => ({ difficulty: key, ...val })))
        : []
    const rawSub = report.breakdown_by_subject ?? report.subject_breakdown
    const subBreak = rawSub
        ? (Array.isArray(rawSub) ? rawSub : Object.entries(rawSub).map(([key, val]) => ({ subject: key, ...val })))
        : []
    const questions  = report.questions ?? []
    const quizInfo   = attempt.quiz ?? report.quiz ?? {}
    const studentInfo = attempt.user ?? report.student ?? {}
    const passed     = score.passed ?? false

    const filteredQs = questions.filter((q) => {
        const status = q.status ?? (q.is_correct ? 'correct' : q.is_skipped ? 'skipped' : 'incorrect')
        if (filter === 'all') return true
        return status === filter
    })

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
                >
                    <TbArrowLeft /> Back
                </button>
                <button
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition"
                >
                    {downloading ? <TbLoader className="animate-spin" /> : <TbDownload />}
                    {downloading ? 'Generating PDF…' : 'Download PDF'}
                </button>
            </div>

            {/* ── Pass / Fail Banner ── */}
            <div className={`rounded-3xl px-8 py-8 text-center shadow-lg ${passed
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            }`}>
                <div className="text-6xl mb-3">{passed ? '🎉' : '📋'}</div>
                <h1 className="text-3xl font-extrabold text-white mb-1">{quizInfo.title ?? 'Quiz Report'}</h1>
                <p className="text-white/80 text-sm mb-6">
                    {studentInfo.name ?? (`${studentInfo.first_name ?? ''} ${studentInfo.last_name ?? ''}`.trim() || 'Student')}
                    {studentInfo.email ? ` · ${studentInfo.email}` : ''}
                </p>
                <div className="inline-flex flex-col items-center bg-white/20 rounded-2xl px-10 py-4">
                    <div className="text-6xl font-black text-white">
                        {score.percentage != null ? `${Number(score.percentage).toFixed(1)}%` : '—'}
                    </div>
                    <div className={`text-lg font-bold mt-1 uppercase tracking-widest ${passed ? 'text-emerald-100' : 'text-red-100'}`}>
                        {passed ? 'PASSED' : 'FAILED'}
                    </div>
                    <div className="text-white/80 text-sm mt-1">
                        {fmt(score.final_score ?? score.total_marks_obtained)} / {fmt(score.total_marks)} marks
                    </div>
                </div>
            </div>

            {/* ── Attempt Info ── */}
            <SectionCard title="Attempt Information" icon={TbUser}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {[
                        { label: 'Started At',    value: fmtDate(attempt.started_at) },
                        { label: 'Submitted At',  value: fmtDate(attempt.submitted_at) },
                        { label: 'Time Spent',    value: attempt.time_spent ?? fmtTime(score.time_taken_seconds) },
                        { label: 'Attempt No.',   value: attempt.attempt_number != null ? `#${attempt.attempt_number}` : '—' },
                        { label: 'IP Address',    value: attempt.ip_address ?? '—' },
                        { label: 'Quiz Type',     value: quizInfo.type ?? '—' },
                        { label: 'Category',      value: quizInfo.category?.name ?? '—' },
                        { label: 'Rank',          value: score.rank != null ? `#${score.rank}` : '—' },
                    ].map(({ label, value }, i) => (
                        <div key={i}>
                            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{value}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* ── Score Summary ── */}
            <SectionCard title="Score Summary" icon={TbTrophy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                    <StatBox label="Total Marks"     value={fmt(score.total_marks)}         bg="bg-gray-50 dark:bg-gray-700/30" />
                    <StatBox label="Marks Obtained"  value={fmt(score.total_marks_obtained)} bg="bg-blue-50 dark:bg-blue-900/20"    color="text-blue-600" />
                    <StatBox label="Negative Marks"  value={score.negative_marks_deducted != null ? `−${score.negative_marks_deducted}` : '—'} bg="bg-red-50 dark:bg-red-900/20" color="text-red-600" />
                    <StatBox label="Final Score"     value={fmt(score.final_score)}          bg={passed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} color={passed ? 'text-emerald-600' : 'text-orange-600'} />
                    <StatBox label="Accuracy"        value={score.accuracy_percentage != null ? `${Number(score.accuracy_percentage).toFixed(1)}%` : '—'} bg="bg-violet-50 dark:bg-violet-900/20" color="text-violet-600" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
                        <TbCheck className="text-2xl text-emerald-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-emerald-600">{fmt(score.correct_count, 0)}</div>
                        <div className="text-xs text-gray-500">Correct</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                        <TbX className="text-2xl text-red-500 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-red-500">{fmt(score.incorrect_count, 0)}</div>
                        <div className="text-xs text-gray-500">Incorrect</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 text-center">
                        <TbMinus className="text-2xl text-gray-400 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-gray-500">{fmt(score.skipped_count, 0)}</div>
                        <div className="text-xs text-gray-500">Skipped</div>
                    </div>
                </div>
            </SectionCard>

            {/* ── Difficulty Breakdown ── */}
            {diffBreak.length > 0 && (
                <SectionCard title="Breakdown by Difficulty" icon={TbAdjustments}>
                    <BreakdownTable
                        rowLabel="Difficulty"
                        rows={diffBreak.map((d) => ({
                            label:     d.difficulty,
                            total:     d.total,
                            correct:   d.correct,
                            incorrect: d.incorrect,
                            skipped:   d.skipped,
                            marks:     d.marks_obtained,
                        }))}
                    />
                </SectionCard>
            )}

            {/* ── Subject Breakdown ── */}
            {subBreak.length > 0 && (
                <SectionCard title="Breakdown by Subject" icon={TbSchool}>
                    <BreakdownTable
                        rowLabel="Subject"
                        rows={subBreak.map((s) => ({
                            label:     s.subject ?? s.name,
                            total:     s.total,
                            correct:   s.correct,
                            incorrect: s.incorrect,
                            skipped:   s.skipped,
                            marks:     s.marks_obtained,
                        }))}
                    />
                </SectionCard>
            )}

            {/* ── Question-by-Question Review ── */}
            <div>
                <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <TbChartBar className="text-primary text-lg" />
                        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
                            Question-by-Question Review
                        </h3>
                        <span className="text-xs text-gray-400">({questions.length} questions)</span>
                    </div>
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                        {[
                            { key: 'all',       label: 'All',       count: questions.length },
                            { key: 'correct',   label: 'Correct',   count: score.correct_count   ?? questions.filter((q) => q.status === 'correct').length },
                            { key: 'incorrect', label: 'Incorrect', count: score.incorrect_count ?? questions.filter((q) => q.status === 'incorrect').length },
                            { key: 'skipped',   label: 'Skipped',   count: score.skipped_count   ?? questions.filter((q) => q.status === 'skipped').length },
                        ].map(({ key, label, count }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === key
                                    ? 'bg-white dark:bg-gray-800 shadow text-primary'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                {label} <span className="ml-1 opacity-60">({count ?? 0})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {filteredQs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        No questions in this category.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredQs.map((q, i) => (
                            <QuestionCard key={q.id ?? i} q={q} idx={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Bottom PDF button ── */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-60 transition shadow-lg"
                >
                    {downloading ? <TbLoader className="animate-spin" /> : <TbDownload />}
                    {downloading ? 'Generating PDF…' : 'Download Full Report PDF'}
                </button>
            </div>
        </div>
    )
}

export default QuizReport

import { useState, useEffect, useMemo } from 'react'
import Steps from '@/components/ui/Steps'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { Form, FormItem } from '@/components/ui/Form'
import DatePicker from '@/components/ui/DatePicker'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiGetQuizCategories } from '@/services/QuizService'
import { apiGetQuestions, apiGetSubjects, apiGetTopics } from '@/services/QBankService'
import MathRichTextEditor from '@/components/shared/MathRichTextEditor'
import {
    TbPlus, TbTrash, TbSearch, TbArrowUp, TbArrowDown,
    TbChevronDown, TbChevronUp, TbFilter,
    TbChecks, TbSection, TbAlertCircle,
} from 'react-icons/tb'



// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    instructions: z.string().optional(),
    category_id: z.any().nullable().optional(),
    type: z.string().default('quiz'),
    access_type: z.string().default('free'),
    visibility: z.string().default('public'),
    price: z.coerce.number().optional().nullable(),
})

const step2Schema = z.object({
    duration_mode: z.string().default('unlimited'),
    total_duration_min: z.coerce.number().optional().nullable(),
    marks_mode: z.string().default('fixed'),
    fixed_marks_per_question: z.coerce.number().optional().nullable(),
    negative_marking: z.boolean().default(false),
    negative_marks_per_question: z.coerce.number().optional().nullable(),
    pass_percentage: z.coerce.number().optional().nullable(),
    shuffle_questions: z.boolean().default(false),
    shuffle_options: z.boolean().default(false),
    max_attempts: z.coerce.number().optional().nullable(),
    disable_finish_button: z.boolean().default(false),
    enable_question_list_view: z.boolean().default(true),
    hide_solutions: z.boolean().default(false),
    show_leaderboard: z.boolean().default(false),
    show_result_immediately: z.boolean().default(true),
    allow_review_after_submit: z.boolean().default(true),
    auto_submit_on_timeout: z.boolean().default(true),
})

// ─── Options ──────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [{ value: 'quiz', label: 'Quiz' }, { value: 'exam', label: 'Exam' }]
const ACCESS_OPTIONS = [{ value: 'free', label: 'Free' }, { value: 'paid', label: 'Paid' }]
const VISIBILITY_OPTIONS = [{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }]
const DURATION_OPTIONS = [
    { value: 'auto', label: 'Auto (no time limit)' },
    { value: 'manual', label: 'Manual (fixed total time)' },
]
const MARKS_MODE_OPTIONS = [{ value: 'fixed', label: 'Fixed (same marks for all)' }, { value: 'question_wise', label: 'Question-wise (custom per question)' }]
const DIFFICULTY_OPTIONS = [
    { value: '', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
]
const QUESTION_TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'mcq', label: 'MCQ' },
    { value: 'msq', label: 'MSQ' },
    { value: 'true_false', label: 'True/False' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' },
]

// ─── Step 1: Details ──────────────────────────────────────────────────────────

const StepDetails = ({ control, errors, categoryOptions, watchAccessType }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem label="Title *" className="md:col-span-2" invalid={!!errors.title} errorMessage={errors.title?.message}>
            <Controller name="title" control={control} render={({ field }) => <Input {...field} placeholder="e.g. NEET Mock Test 2025" />} />
        </FormItem>

        <FormItem label="Description" className="md:col-span-2">
            <Controller name="description" control={control} render={({ field }) => (
                <MathRichTextEditor
                    content={field.value ?? ''}
                    onChange={(val) => field.onChange(typeof val === 'object' ? (val.html ?? '') : val)}
                    placeholder="Write a description for this quiz..."
                />
            )} />
        </FormItem>

        <FormItem
            label="Instructions for Students"
            className="md:col-span-2"
            extra={<span className="text-xs text-gray-400">Shown to students before they start the quiz</span>}
        >
            <Controller name="instructions" control={control} render={({ field }) => (
                <MathRichTextEditor
                    content={field.value ?? ''}
                    onChange={(val) => field.onChange(typeof val === 'object' ? (val.html ?? '') : val)}
                    placeholder="e.g. Read each question carefully. Each correct answer carries 4 marks. There is negative marking of 1 mark for wrong answers..."
                />
            )} />
        </FormItem>

        <FormItem label="Category">
            <Controller name="category_id" control={control} render={({ field }) => (
                <Select isClearable placeholder="Select category" options={categoryOptions}
                    value={categoryOptions.find((o) => o.value === field.value) || null}
                    onChange={(opt) => field.onChange(opt?.value || null)} />
            )} />
        </FormItem>
        <FormItem label="Type">
            <Controller name="type" control={control} render={({ field }) => (
                <Select options={TYPE_OPTIONS} value={TYPE_OPTIONS.find((o) => o.value === field.value)}
                    onChange={(opt) => field.onChange(opt.value)} />
            )} />
        </FormItem>
        <FormItem label="Access">
            <Controller name="access_type" control={control} render={({ field }) => (
                <Select options={ACCESS_OPTIONS} value={ACCESS_OPTIONS.find((o) => o.value === field.value)}
                    onChange={(opt) => field.onChange(opt.value)} />
            )} />
        </FormItem>
        <FormItem label="Visibility">
            <Controller name="visibility" control={control} render={({ field }) => (
                <Select options={VISIBILITY_OPTIONS} value={VISIBILITY_OPTIONS.find((o) => o.value === field.value)}
                    onChange={(opt) => field.onChange(opt.value)} />
            )} />
        </FormItem>
        {watchAccessType === 'paid' && (
            <FormItem label="Price (₹)">
                <Controller name="price" control={control} render={({ field }) => <Input type="number" {...field} placeholder="0" />} />
            </FormItem>
        )}
    </div>
)

// ─── Step 2: Settings ─────────────────────────────────────────────────────────

const SwitchRow = ({ label, name, control }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
        <span className="text-sm">{label}</span>
        <Controller name={name} control={control} render={({ field }) => (
            <Switcher checked={field.value} onChange={field.onChange} />
        )} />
    </div>
)

const StepSettings = ({ control, watchDurationMode, watchNegative, watchMarksMode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
            <h6 className="font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide">Duration & Marks</h6>
            <FormItem label="Duration Mode">
                <Controller name="duration_mode" control={control} render={({ field }) => (
                    <Select options={DURATION_OPTIONS} value={DURATION_OPTIONS.find((o) => o.value === field.value)}
                        onChange={(opt) => field.onChange(opt.value)} />
                )} />
            </FormItem>
            {watchDurationMode === 'manual' && (
                <FormItem label="Total Duration (min)">
                    <Controller name="total_duration_min" control={control} render={({ field }) => <Input type="number" {...field} />} />
                </FormItem>
            )}
            <FormItem label="Marks Mode">
                <Controller name="marks_mode" control={control} render={({ field }) => (
                    <Select options={MARKS_MODE_OPTIONS} value={MARKS_MODE_OPTIONS.find((o) => o.value === field.value)}
                        onChange={(opt) => field.onChange(opt.value)} />
                )} />
            </FormItem>
            {watchMarksMode === 'fixed' && (
                <FormItem label="Marks per Question">
                    <Controller name="fixed_marks_per_question" control={control} render={({ field }) => <Input type="number" {...field} />} />
                </FormItem>
            )}
            <SwitchRow label="Negative Marking" name="negative_marking" control={control} />
            {watchNegative && (
                <FormItem label="Negative Marks per Question">
                    <Controller name="negative_marks_per_question" control={control} render={({ field }) => <Input type="number" {...field} />} />
                </FormItem>
            )}
            <FormItem label="Pass Percentage (%)">
                <Controller name="pass_percentage" control={control} render={({ field }) => <Input type="number" {...field} placeholder="e.g. 40" />} />
            </FormItem>
            <FormItem label="Max Attempts">
                <Controller name="max_attempts" control={control} render={({ field }) => <Input type="number" {...field} placeholder="Leave empty for unlimited" />} />
            </FormItem>
        </div>

        <div className="space-y-1">
            <h6 className="font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3">Behaviour</h6>
            <SwitchRow label="Shuffle Questions" name="shuffle_questions" control={control} />
            <SwitchRow label="Shuffle Options" name="shuffle_options" control={control} />
            <SwitchRow label="Show Result Immediately" name="show_result_immediately" control={control} />
            <SwitchRow label="Allow Review After Submit" name="allow_review_after_submit" control={control} />
            <SwitchRow label="Show Leaderboard" name="show_leaderboard" control={control} />
            <SwitchRow label="Hide Solutions" name="hide_solutions" control={control} />
            <SwitchRow label="Enable Question List View" name="enable_question_list_view" control={control} />
            <SwitchRow label="Disable Finish Button" name="disable_finish_button" control={control} />
            <SwitchRow label="Auto Submit on Timeout" name="auto_submit_on_timeout" control={control} />
        </div>
    </div>
)

// ─── Step 3: Questions + Sections ─────────────────────────────────────────────

const emptySection = (idx) => ({ _key: `new_${Date.now()}_${idx}`, id: null, title: '', instructions: '', sort_order: idx })

const DIFF_COLORS = {
    easy:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    hard:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}
const TYPE_COLORS = {
    mcq:          'bg-blue-100 text-blue-700',
    multi_select: 'bg-violet-100 text-violet-700',
    true_false:   'bg-teal-100 text-teal-700',
    short_answer: 'bg-cyan-100 text-cyan-700',
    long_answer:  'bg-indigo-100 text-indigo-700',
    fill_blank:   'bg-orange-100 text-orange-700',
    match_column: 'bg-pink-100 text-pink-700',
}

const StepQuestions = ({ selectedQuestions, onAddQuestion, onRemoveQuestion, onChangeMarks, onChangeSectionKey, sections, onSectionsChange, onReorder }) => {
    const [filters, setFilters] = useState({ search: '', type: '', difficulty: '', subject_id: '', topic_id: '' })
    const [qResults, setQResults] = useState([])
    const [qLoading, setQLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [subjects, setSubjects] = useState([])
    const [topics, setTopics] = useState([])
    const [sectionsOpen, setSectionsOpen] = useState(sections.length > 0)
    const [searchOpen, setSearchOpen] = useState(true)
    const [filtersOpen, setFiltersOpen] = useState(false)

    useEffect(() => {
        apiGetSubjects({ active_only: true }).then((res) => setSubjects(res?.data || [])).catch(() => {})
    }, [])

    const subjectOptions = useMemo(
        () => [{ value: '', label: 'All Subjects' }, ...subjects.map((s) => ({ value: s.id, label: s.name }))],
        [subjects]
    )
    const topicOptions = useMemo(
        () => [{ value: '', label: 'All Topics' }, ...topics.map((t) => ({ value: t.id, label: t.name }))],
        [topics]
    )

    const handleSubjectChange = async (val) => {
        setFilters((f) => ({ ...f, subject_id: val, topic_id: '' }))
        if (val) {
            try {
                const res = await apiGetTopics(val, {})
                setTopics(res?.data || [])
            } catch { setTopics([]) }
        } else {
            setTopics([])
        }
    }

    const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }))

    const selectedIds = useMemo(() => new Set(selectedQuestions.map((q) => q.question_id)), [selectedQuestions])

    const sectionSelectOptions = useMemo(
        () => [{ value: '', label: 'No Section' }, ...sections.map((s) => ({ value: s._key, label: s.title || '(Untitled Section)' }))],
        [sections]
    )

    const searchQuestions = async () => {
        setQLoading(true)
        setSearched(true)
        try {
            const params = { per_page: 30 }
            if (filters.search) params.search = filters.search
            if (filters.type) params.type = filters.type
            if (filters.difficulty) params.difficulty = filters.difficulty
            if (filters.subject_id) params.subject_id = filters.subject_id
            if (filters.topic_id) params.topic_id = filters.topic_id
            const res = await apiGetQuestions(params)
            setQResults(res?.data?.data || res?.data || [])
        } catch {
            toast.push(<Notification type="danger" title="Search failed" />, { placement: 'top-center' })
        } finally {
            setQLoading(false)
        }
    }

    const addSection = () => {
        const next = [...sections, emptySection(sections.length)]
        onSectionsChange(next)
        if (!sectionsOpen) setSectionsOpen(true)
    }
    const removeSection = (key) => onSectionsChange(sections.filter((s) => s._key !== key))
    const updateSection = (key, field, val) =>
        onSectionsChange(sections.map((s) => s._key === key ? { ...s, [field]: val } : s))

    const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); searchQuestions() } }

    const moveQuestion = (idx, dir) => {
        const target = idx + dir
        if (target < 0 || target >= selectedQuestions.length) return
        const next = [...selectedQuestions]
        const temp = next[idx]
        next[idx] = next[target]
        next[target] = temp
        next.forEach((q, i) => { q.sort_order = i + 1 })
        if (onReorder) onReorder(next)
    }

    // Section-based question counts
    const sectionCounts = useMemo(() => {
        const counts = {}
        selectedQuestions.forEach((q) => {
            const key = q._sectionKey || '__none__'
            counts[key] = (counts[key] || 0) + 1
        })
        return counts
    }, [selectedQuestions])

    const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim()

    return (
        <div className="space-y-5">
            {/* ── Summary stats bar ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 text-center">
                    <div className="text-xl font-bold text-blue-600">{selectedQuestions.length}</div>
                    <div className="text-xs text-gray-500">Questions</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 text-center">
                    <div className="text-xl font-bold text-emerald-600">{sections.length}</div>
                    <div className="text-xs text-gray-500">Sections</div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 text-center">
                    <div className="text-xl font-bold text-amber-600">
                        {selectedQuestions.reduce((sum, q) => sum + (q.marks_override || 0), 0) || '—'}
                    </div>
                    <div className="text-xs text-gray-500">Custom Marks</div>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl px-4 py-3 text-center">
                    <div className="text-xl font-bold text-violet-600">
                        {[...new Set(selectedQuestions.map((q) => q._difficulty).filter(Boolean))].length}
                    </div>
                    <div className="text-xs text-gray-500">Difficulty Levels</div>
                </div>
            </div>

            {/* ── Sections panel ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                    onClick={() => setSectionsOpen((v) => !v)}
                >
                    <div className="flex items-center gap-2">
                        <TbSection className="text-primary text-lg" />
                        <span className="font-semibold text-sm">Sections</span>
                        {sections.length > 0 && (
                            <span className="text-xs bg-primary text-white rounded-full px-2 py-0.5">{sections.length}</span>
                        )}
                        <span className="text-xs text-gray-400 hidden sm:inline">(optional — group questions by subject/topic)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-xs text-primary font-medium hover:underline cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); addSection() }}
                        >
                            + Add Section
                        </span>
                        {sectionsOpen ? <TbChevronUp className="text-gray-400" /> : <TbChevronDown className="text-gray-400" />}
                    </div>
                </button>

                {sectionsOpen && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                        {sections.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-400 mb-2">No sections yet.</p>
                                <Button size="sm" variant="twoTone" icon={<TbPlus />} onClick={addSection}>
                                    Add First Section
                                </Button>
                            </div>
                        ) : sections.map((s, i) => (
                            <div key={s._key} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm font-medium">{s.title || '(Untitled Section)'}</span>
                                        <span className="text-xs text-gray-400">{sectionCounts[s._key] || 0} questions</span>
                                    </div>
                                    <Button size="xs" variant="plain" className="text-red-500" icon={<TbTrash />}
                                        onClick={() => removeSection(s._key)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input
                                        placeholder="Section title (e.g. Physics)"
                                        value={s.title}
                                        onChange={(e) => updateSection(s._key, 'title', e.target.value)}
                                        size="sm"
                                    />
                                    <Input
                                        placeholder="Instructions (e.g. Attempt all 45 questions)"
                                        value={s.instructions}
                                        onChange={(e) => updateSection(s._key, 'instructions', e.target.value)}
                                        size="sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Question search panel ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                    onClick={() => setSearchOpen((v) => !v)}
                >
                    <div className="flex items-center gap-2">
                        <TbSearch className="text-primary text-lg" />
                        <span className="font-semibold text-sm">Search Question Bank</span>
                        {qResults.length > 0 && searched && (
                            <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
                                {qResults.length} found
                            </span>
                        )}
                    </div>
                    {searchOpen ? <TbChevronUp className="text-gray-400" /> : <TbChevronDown className="text-gray-400" />}
                </button>

                {searchOpen && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                        {/* Search + quick filter row */}
                        <div className="flex gap-2 items-center">
                            <Input
                                prefix={<TbSearch />}
                                placeholder="Search by keyword..."
                                value={filters.search}
                                onChange={(e) => setFilter('search', e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1"
                            />
                            <Button variant="solid" size="sm" icon={<TbSearch />} onClick={searchQuestions} loading={qLoading}>
                                Search
                            </Button>
                            <button
                                type="button"
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border transition
                                    ${filtersOpen
                                        ? 'bg-primary/10 text-primary border-primary'
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-500 border-gray-200 dark:border-gray-600 hover:border-primary'
                                    }`}
                                onClick={() => setFiltersOpen((v) => !v)}
                            >
                                <TbFilter className="text-sm" /> Filters
                            </button>
                        </div>

                        {/* Expandable filters */}
                        {filtersOpen && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
                                <Select
                                    options={QUESTION_TYPE_OPTIONS}
                                    value={QUESTION_TYPE_OPTIONS.find((o) => o.value === filters.type)}
                                    onChange={(opt) => setFilter('type', opt?.value ?? '')}
                                    placeholder="Type"
                                    size="sm"
                                />
                                <Select
                                    options={DIFFICULTY_OPTIONS}
                                    value={DIFFICULTY_OPTIONS.find((o) => o.value === filters.difficulty)}
                                    onChange={(opt) => setFilter('difficulty', opt?.value ?? '')}
                                    placeholder="Difficulty"
                                    size="sm"
                                />
                                <Select
                                    options={subjectOptions}
                                    value={subjectOptions.find((o) => o.value === filters.subject_id)}
                                    onChange={(opt) => handleSubjectChange(opt?.value ?? '')}
                                    placeholder="Subject"
                                    size="sm"
                                />
                                <Select
                                    options={topicOptions}
                                    value={topicOptions.find((o) => o.value === filters.topic_id)}
                                    onChange={(opt) => setFilter('topic_id', opt?.value ?? '')}
                                    placeholder="Topic"
                                    size="sm"
                                    isDisabled={!filters.subject_id}
                                />
                            </div>
                        )}

                        {/* Search results */}
                        {searched && (
                            <div className="max-h-72 overflow-y-auto space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                                {qLoading ? (
                                    <div className="flex justify-center py-6"><Spinner /></div>
                                ) : qResults.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400">
                                        <TbAlertCircle className="mx-auto text-2xl mb-2" />
                                        <p className="text-sm">No questions found. Try different filters.</p>
                                    </div>
                                ) : qResults.map((q) => {
                                    const alreadyAdded = selectedIds.has(q.id)
                                    return (
                                        <div key={q.id}
                                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all
                                                ${alreadyAdded
                                                    ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-primary hover:shadow-sm bg-white dark:bg-gray-700/30'
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">
                                                    {stripHtml(q.question_text).substring(0, 120) || '—'}
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[q.type] || 'bg-gray-100 text-gray-500'}`}>
                                                        {(q.type || '').replace(/_/g, ' ')}
                                                    </span>
                                                    {q.difficulty && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[q.difficulty] || 'bg-gray-100 text-gray-500'}`}>
                                                            {q.difficulty}
                                                        </span>
                                                    )}
                                                    {q.marks && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-500 font-medium">
                                                            {q.marks} marks
                                                        </span>
                                                    )}
                                                    {q.subject?.name && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                                            {q.subject.name}
                                                        </span>
                                                    )}
                                                    {q.topic?.name && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium">
                                                            {q.topic.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                size="xs"
                                                variant={alreadyAdded ? 'default' : 'solid'}
                                                icon={alreadyAdded ? <TbChecks /> : <TbPlus />}
                                                disabled={alreadyAdded}
                                                onClick={() => onAddQuestion(q)}
                                                className="shrink-0 mt-1"
                                            >
                                                {alreadyAdded ? 'Added' : 'Add'}
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Selected questions ── */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TbChecks className="text-primary text-lg" />
                        <span className="font-semibold text-sm">Selected Questions</span>
                        <span className="text-xs bg-primary text-white rounded-full px-2 py-0.5">{selectedQuestions.length}</span>
                    </div>
                    {selectedQuestions.length > 0 && (
                        <span className="text-xs text-gray-400">Drag to reorder with ↑↓ buttons</span>
                    )}
                </div>

                <div className="p-4">
                    {selectedQuestions.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
                            <TbSearch className="mx-auto text-3xl text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400 mb-1">No questions added yet</p>
                            <p className="text-xs text-gray-300">Search and add questions from the panel above</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {selectedQuestions.map((sq, idx) => (
                                <div
                                    key={sq.question_id}
                                    className="flex items-start gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/20 hover:border-primary/40 transition group"
                                >
                                    {/* Order controls */}
                                    <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
                                        <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => moveQuestion(idx, -1)}
                                            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition"
                                        >
                                            <TbArrowUp size={14} />
                                        </button>
                                        <span className="text-xs font-bold text-gray-400 w-6 text-center">{idx + 1}</span>
                                        <button
                                            type="button"
                                            disabled={idx === selectedQuestions.length - 1}
                                            onClick={() => moveQuestion(idx, 1)}
                                            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition"
                                        >
                                            <TbArrowDown size={14} />
                                        </button>
                                    </div>

                                    {/* Question content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug mb-2">
                                            {stripHtml(sq._preview).substring(0, 120) || '—'}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {sq._type && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[sq._type] || 'bg-gray-100 text-gray-500'}`}>
                                                    {(sq._type || '').replace(/_/g, ' ')}
                                                </span>
                                            )}
                                            {sq._difficulty && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[sq._difficulty] || 'bg-gray-100 text-gray-500'}`}>
                                                    {sq._difficulty}
                                                </span>
                                            )}
                                            {sq._subject && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                                    {sq._subject}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                                        {sections.length > 0 && (
                                            <Select
                                                options={sectionSelectOptions}
                                                value={sectionSelectOptions.find((o) => o.value === (sq._sectionKey ?? '')) || sectionSelectOptions[0]}
                                                onChange={(opt) => onChangeSectionKey(sq.question_id, opt?.value ?? '')}
                                                className="w-36"
                                                size="sm"
                                            />
                                        )}
                                        <Input
                                            type="number"
                                            className="w-20"
                                            size="sm"
                                            placeholder="Marks"
                                            value={sq.marks_override ?? ''}
                                            onChange={(e) => onChangeMarks(sq.question_id, e.target.value === '' ? null : Number(e.target.value))}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onRemoveQuestion(sq.question_id)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition"
                                        >
                                            <TbTrash size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Step 4: Schedules ────────────────────────────────────────────────────────

const emptySchedule = () => ({ title: '', starts_at: null, ends_at: null, grace_period_min: 0 })

const StepSchedules = ({ schedules, onChange }) => {
    const add = () => onChange([...schedules, emptySchedule()])
    const remove = (i) => onChange(schedules.filter((_, idx) => idx !== i))
    const update = (i, key, val) => onChange(schedules.map((s, idx) => idx === i ? { ...s, [key]: val } : s))

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Define one or more time windows when this quiz is available. Leave empty for always available.
                </p>
                <Button size="sm" variant="solid" icon={<TbPlus />} onClick={add}>Add Schedule</Button>
            </div>

            {schedules.length === 0 ? (
                <div className="text-center text-gray-400 py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    No schedules — quiz will always be accessible
                </div>
            ) : (
                <div className="space-y-4">
                    {schedules.map((s, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative">
                            <Button
                                size="xs"
                                variant="plain"
                                className="text-red-500 absolute top-3 right-3"
                                icon={<TbTrash />}
                                onClick={() => remove(i)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                                <FormItem label="Schedule Title">
                                    <Input
                                        value={s.title}
                                        onChange={(e) => update(i, 'title', e.target.value)}
                                        placeholder="e.g. Morning Session"
                                    />
                                </FormItem>
                                <FormItem label="Grace Period (min)">
                                    <Input
                                        type="number"
                                        value={s.grace_period_min}
                                        onChange={(e) => update(i, 'grace_period_min', Number(e.target.value))}
                                        placeholder="0"
                                    />
                                </FormItem>
                                <FormItem label="Starts At">
                                    <DatePicker.DateTimepicker
                                        value={s.starts_at ? new Date(s.starts_at) : null}
                                        onChange={(date) => update(i, 'starts_at', date ? date.toISOString() : null)}
                                        placeholder="Select start date & time"
                                    />
                                </FormItem>
                                <FormItem label="Ends At">
                                    <DatePicker.DateTimepicker
                                        value={s.ends_at ? new Date(s.ends_at) : null}
                                        onChange={(date) => update(i, 'ends_at', date ? date.toISOString() : null)}
                                        placeholder="Select end date & time"
                                    />
                                </FormItem>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main QuizForm ─────────────────────────────────────────────────────────────

const STEP_TITLES = ['Details', 'Settings', 'Questions', 'Schedules']

const defaultStep2 = {
    duration_mode: 'auto',
    total_duration_min: null,
    marks_mode: 'fixed',
    fixed_marks_per_question: 1,
    negative_marking: false,
    negative_marks_per_question: null,
    pass_percentage: null,
    shuffle_questions: false,
    shuffle_options: false,
    max_attempts: null,
    disable_finish_button: false,
    enable_question_list_view: true,
    hide_solutions: false,
    show_leaderboard: false,
    show_result_immediately: true,
    allow_review_after_submit: true,
    auto_submit_on_timeout: true,
}

const QuizForm = ({ initialData, onSubmit, submitting, serverErrors }) => {
    const [step, setStep] = useState(0)
    const [categories, setCategories] = useState([])
    const [selectedQuestions, setSelectedQuestions] = useState([])
    const [schedules, setSchedules] = useState([])
    const [sections, setSections] = useState([])

    useEffect(() => {
        apiGetQuizCategories().then((res) => setCategories(res?.data || [])).catch(() => {})
    }, [])

    useEffect(() => {
        if (initialData) {
            if (initialData.sections) {
                setSections(initialData.sections)
            }
            if (initialData.questions) {
                setSelectedQuestions(
                    initialData.questions.map((q, idx) => ({
                        question_id: q.question_id ?? q.id,
                        sort_order: q.sort_order ?? idx + 1,
                        marks_override: q.marks_override ?? null,
                        _sectionKey: q._sectionKey ?? '',
                        _preview: q._preview ?? '',
                        _difficulty: q._difficulty ?? '',
                    }))
                )
            }
            if (initialData.schedules) {
                setSchedules(initialData.schedules.map((s) => ({
                    title: s.title ?? '',
                    starts_at: s.starts_at ?? null,
                    ends_at: s.ends_at ?? null,
                    grace_period_min: s.grace_period_min ?? 0,
                })))
            }
        }
    }, [initialData])

    const categoryOptions = useMemo(
        () => categories.map((c) => ({ value: c.id, label: c.name })),
        [categories]
    )

    // Step 1 form
    const form1 = useForm({
        resolver: zodResolver(step1Schema),
        defaultValues: initialData
            ? {
                title: initialData.title ?? '',
                description: initialData.description ?? '',
                category_id: initialData.category_id ?? null,
                type: initialData.type ?? 'quiz',
                access_type: initialData.access_type ?? 'free',
                visibility: initialData.visibility ?? 'public',
                price: initialData.price ?? null,
            }
            : { title: '', description: '', category_id: null, type: 'quiz', access_type: 'free', visibility: 'public', price: null },
    })

    // Step 2 form
    const form2 = useForm({
        resolver: zodResolver(step2Schema),
        defaultValues: initialData
            ? {
                duration_mode: initialData.duration_mode ?? 'unlimited',
                total_duration_min: initialData.total_duration_min ?? null,
                marks_mode: initialData.marks_mode ?? 'fixed',
                fixed_marks_per_question: initialData.fixed_marks_per_question ?? 1,
                negative_marking: initialData.negative_marking ?? false,
                negative_marks_per_question: initialData.negative_marks_per_question ?? null,
                pass_percentage: initialData.pass_percentage ?? null,
                shuffle_questions: initialData.shuffle_questions ?? false,
                shuffle_options: initialData.shuffle_options ?? false,
                max_attempts: initialData.max_attempts ?? null,
                disable_finish_button: initialData.disable_finish_button ?? false,
                enable_question_list_view: initialData.enable_question_list_view ?? true,
                hide_solutions: initialData.hide_solutions ?? false,
                show_leaderboard: initialData.show_leaderboard ?? false,
                show_result_immediately: initialData.show_result_immediately ?? true,
                allow_review_after_submit: initialData.allow_review_after_submit ?? true,
                auto_submit_on_timeout: initialData.auto_submit_on_timeout ?? true,
            }
            : defaultStep2,
    })

    const watchAccessType = form1.watch('access_type')
    const watchDurationMode = form2.watch('duration_mode')
    const watchNegative = form2.watch('negative_marking')
    const watchMarksMode = form2.watch('marks_mode')

    const addQuestion = (q) => {
        if (selectedQuestions.find((sq) => sq.question_id === q.id)) return
        setSelectedQuestions((prev) => [
            ...prev,
            {
                question_id: q.id,
                sort_order: prev.length + 1,
                marks_override: null,
                _preview: q.question_text ?? '',
                _difficulty: q.difficulty ?? '',
                _type: q.type ?? '',
                _subject: q.subject?.name ?? '',
            },
        ])
    }

    const removeQuestion = (qid) => {
        setSelectedQuestions((prev) =>
            prev.filter((q) => q.question_id !== qid).map((q, i) => ({ ...q, sort_order: i + 1 }))
        )
    }

    const changeMarks = (qid, val) => {
        setSelectedQuestions((prev) =>
            prev.map((q) => q.question_id === qid ? { ...q, marks_override: val } : q)
        )
    }

    const changeSectionKey = (qid, key) => {
        setSelectedQuestions((prev) =>
            prev.map((q) => q.question_id === qid ? { ...q, _sectionKey: key } : q)
        )
    }

    const goNext = async () => {
        if (step === 0) {
            const valid = await form1.trigger()
            if (!valid) return
        }
        if (step === 1) {
            const valid = await form2.trigger()
            if (!valid) return
        }
        setStep((s) => Math.min(s + 1, 3))
    }

    const handleFinalSubmit = async () => {
        const [v1, v2] = await Promise.all([form1.trigger(), form2.trigger()])
        if (!v1 || !v2) {
            toast.push(
                <Notification type="warning" title="Please fix form errors in Details or Settings steps" />,
                { placement: 'top-center' }
            )
            return
        }

        const details = form1.getValues()
        const settings = form2.getValues()

        const payload = {
            ...details,
            ...settings,
            sections: sections.map((s, i) => ({
                title: s.title,
                instructions: s.instructions,
                sort_order: i,
            })),
            questions: selectedQuestions.map(({ question_id, sort_order, marks_override, _sectionKey }) => {
                const matchedSection = sections.find((s) => s._key === _sectionKey)
                return {
                    question_id,
                    sort_order,
                    section_id: matchedSection?.id ?? null,
                    ...(marks_override != null ? { marks_override } : {}),
                }
            }),
            schedules: schedules.map((s) => ({
                title: s.title,
                starts_at: s.starts_at,
                ends_at: s.ends_at,
                grace_period_min: s.grace_period_min,
            })),
        }

        onSubmit(payload)
    }

    // Show server-side 422 errors
    const serverErrorList = serverErrors
        ? Object.entries(serverErrors).flatMap(([field, msgs]) =>
            Array.isArray(msgs) ? msgs.map((m) => `${field}: ${m}`) : [`${field}: ${msgs}`]
        )
        : []

    return (
        <div className="space-y-6">
            {/* Steps indicator — desktop: horizontal, mobile: compact progress bar */}
            <div className="hidden sm:block">
                <Steps current={step}>
                    {STEP_TITLES.map((title, i) => (
                        <Steps.Item key={i} title={title} />
                    ))}
                </Steps>
            </div>
            <div className="sm:hidden">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                        Step {step + 1} of {STEP_TITLES.length}
                    </span>
                    <span className="text-sm text-gray-500">{STEP_TITLES[step]}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1">
                    {STEP_TITLES.map((title, i) => (
                        <span
                            key={i}
                            className={`text-xs ${i === step ? 'text-primary font-medium' : i < step ? 'text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}
                        >
                            {title}
                        </span>
                    ))}
                </div>
            </div>

            {/* Server-side validation errors */}
            {serverErrorList.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="font-semibold text-red-700 dark:text-red-400 text-sm mb-2">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {serverErrorList.map((msg, i) => (
                            <li key={i} className="text-sm text-red-600 dark:text-red-300">{msg}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Step content */}
            <div className="min-h-64">
                {step === 0 && (
                    <Form>
                        <StepDetails
                            control={form1.control}
                            errors={form1.formState.errors}
                            categoryOptions={categoryOptions}
                            watchAccessType={watchAccessType}
                        />
                    </Form>
                )}
                {step === 1 && (
                    <Form>
                        <StepSettings
                            control={form2.control}
                            watchDurationMode={watchDurationMode}
                            watchNegative={watchNegative}
                            watchMarksMode={watchMarksMode}
                        />
                    </Form>
                )}
                {step === 2 && (
                    <StepQuestions
                        selectedQuestions={selectedQuestions}
                        onAddQuestion={addQuestion}
                        onRemoveQuestion={removeQuestion}
                        onChangeMarks={changeMarks}
                        onChangeSectionKey={changeSectionKey}
                        onReorder={setSelectedQuestions}
                        sections={sections}
                        onSectionsChange={setSections}
                    />
                )}
                {step === 3 && (
                    <StepSchedules schedules={schedules} onChange={setSchedules} />
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button variant="plain" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                    Back
                </Button>
                <div className="flex gap-2">
                    {step < 3 ? (
                        <Button variant="solid" onClick={goNext}>Next</Button>
                    ) : (
                        <Button variant="solid" loading={submitting} onClick={handleFinalSubmit}>
                            {submitting ? 'Saving...' : 'Save Quiz'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuizForm

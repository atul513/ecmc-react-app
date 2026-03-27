import { useState, useEffect, useMemo } from 'react'
import Steps from '@/components/ui/Steps'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Table from '@/components/ui/Table'
import { Form, FormItem } from '@/components/ui/Form'
import DatePicker from '@/components/ui/DatePicker'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiGetQuizCategories } from '@/services/QuizService'
import { apiGetQuestions, apiGetSubjects, apiGetTopics } from '@/services/QBankService'
import MathRichTextEditor from '@/components/shared/MathRichTextEditor'
import { TbPlus, TbTrash, TbSearch } from 'react-icons/tb'

const { THead, TBody, Tr, Th, Td } = Table

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

const StepQuestions = ({ selectedQuestions, onAddQuestion, onRemoveQuestion, onChangeMarks, onChangeSectionKey, sections, onSectionsChange }) => {
    const [filters, setFilters] = useState({ search: '', type: '', difficulty: '', subject_id: '', topic_id: '' })
    const [qResults, setQResults] = useState([])
    const [qLoading, setQLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [subjects, setSubjects] = useState([])
    const [topics, setTopics] = useState([])
    const [sectionsOpen, setSectionsOpen] = useState(sections.length > 0)

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

    return (
        <div className="space-y-4">
            {/* ── Sections panel ── */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div
                    className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer select-none"
                    onClick={() => setSectionsOpen((v) => !v)}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Sections</span>
                        {sections.length > 0 && (
                            <span className="text-xs bg-primary text-white rounded-full px-2 py-0.5">{sections.length}</span>
                        )}
                        <span className="text-xs text-gray-400">(optional — for exams with multiple subjects)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="xs"
                            variant="solid"
                            icon={<TbPlus />}
                            onClick={(e) => { e.stopPropagation(); addSection() }}
                        >
                            Add Section
                        </Button>
                        <span className="text-gray-400 text-xs">{sectionsOpen ? '▲' : '▼'}</span>
                    </div>
                </div>

                {sectionsOpen && (
                    <div className="p-4 space-y-3">
                        {sections.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-2">
                                No sections yet. Add sections for exams like NEET (Physics / Chemistry / Biology).
                            </p>
                        ) : sections.map((s, i) => (
                            <div key={s._key} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                <div className="md:col-span-1 flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                </div>
                                <div className="md:col-span-4">
                                    <Input
                                        placeholder="Section title (e.g. Physics)"
                                        value={s.title}
                                        onChange={(e) => updateSection(s._key, 'title', e.target.value)}
                                        size="sm"
                                    />
                                </div>
                                <div className="md:col-span-6">
                                    <Input
                                        placeholder="Instructions (e.g. Attempt all 45 questions)"
                                        value={s.instructions}
                                        onChange={(e) => updateSection(s._key, 'instructions', e.target.value)}
                                        size="sm"
                                    />
                                </div>
                                <div className="md:col-span-1 flex justify-end">
                                    <Button
                                        size="xs"
                                        variant="plain"
                                        className="text-red-500"
                                        icon={<TbTrash />}
                                        onClick={() => removeSection(s._key)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Question search ── */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Search Question Bank</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    <Input
                        prefix={<TbSearch />}
                        placeholder="Keyword..."
                        value={filters.search}
                        onChange={(e) => setFilter('search', e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="col-span-2 lg:col-span-2"
                    />
                    <Select
                        options={QUESTION_TYPE_OPTIONS}
                        value={QUESTION_TYPE_OPTIONS.find((o) => o.value === filters.type)}
                        onChange={(opt) => setFilter('type', opt?.value ?? '')}
                        placeholder="Type"
                    />
                    <Select
                        options={DIFFICULTY_OPTIONS}
                        value={DIFFICULTY_OPTIONS.find((o) => o.value === filters.difficulty)}
                        onChange={(opt) => setFilter('difficulty', opt?.value ?? '')}
                        placeholder="Difficulty"
                    />
                    <Select
                        options={subjectOptions}
                        value={subjectOptions.find((o) => o.value === filters.subject_id)}
                        onChange={(opt) => handleSubjectChange(opt?.value ?? '')}
                        placeholder="Subject"
                    />
                    <Select
                        options={topicOptions}
                        value={topicOptions.find((o) => o.value === filters.topic_id)}
                        onChange={(opt) => setFilter('topic_id', opt?.value ?? '')}
                        placeholder="Topic"
                        isDisabled={!filters.subject_id}
                    />
                </div>
                <Button variant="solid" size="sm" icon={<TbSearch />} onClick={searchQuestions} loading={qLoading}>
                    Search
                </Button>

                {searched && (
                    <div className="mt-2 max-h-60 overflow-y-auto space-y-1 border-t border-gray-100 dark:border-gray-700 pt-2">
                        {qLoading ? (
                            <div className="flex justify-center py-4"><Spinner /></div>
                        ) : qResults.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-3">No questions found</p>
                        ) : qResults.map((q) => (
                            <div key={q.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 gap-2">
                                <div className="flex-1 min-w-0">
                                    <div
                                        className="text-sm truncate"
                                        dangerouslySetInnerHTML={{ __html: q.question_text?.replace(/<[^>]+>/g, '').substring(0, 100) + '...' }}
                                    />
                                    <div className="flex gap-2 mt-0.5">
                                        <span className="text-xs text-gray-400 capitalize">{q.difficulty}</span>
                                        <span className="text-xs text-gray-400 uppercase">{q.type}</span>
                                        {q.subject?.name && <span className="text-xs text-gray-400">{q.subject.name}</span>}
                                    </div>
                                </div>
                                <Button
                                    size="xs"
                                    variant="solid"
                                    icon={<TbPlus />}
                                    disabled={selectedIds.has(q.id)}
                                    onClick={() => onAddQuestion(q)}
                                    className="shrink-0"
                                >
                                    {selectedIds.has(q.id) ? 'Added' : 'Add'}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Selected questions ── */}
            <div>
                <p className="text-sm font-medium mb-2">Selected Questions ({selectedQuestions.length})</p>
                {selectedQuestions.length === 0 ? (
                    <div className="text-center text-gray-400 py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        No questions added yet. Search and add questions above.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Question</Th>
                                    <Th>Difficulty</Th>
                                    {sections.length > 0 && <Th>Section</Th>}
                                    <Th>Marks Override</Th>
                                    <Th></Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {selectedQuestions.map((sq, idx) => (
                                    <Tr key={sq.question_id}>
                                        <Td className="text-sm text-gray-400 w-8">{idx + 1}</Td>
                                        <Td>
                                            <div
                                                className="text-sm max-w-xs truncate"
                                                dangerouslySetInnerHTML={{ __html: sq._preview?.replace(/<[^>]+>/g, '').substring(0, 80) + '...' }}
                                            />
                                        </Td>
                                        <Td><span className="text-xs capitalize text-gray-500">{sq._difficulty}</span></Td>
                                        {sections.length > 0 && (
                                            <Td>
                                                <Select
                                                    options={sectionSelectOptions}
                                                    value={sectionSelectOptions.find((o) => o.value === (sq._sectionKey ?? '')) || sectionSelectOptions[0]}
                                                    onChange={(opt) => onChangeSectionKey(sq.question_id, opt?.value ?? '')}
                                                    className="w-44"
                                                    size="sm"
                                                />
                                            </Td>
                                        )}
                                        <Td>
                                            <Input
                                                type="number"
                                                className="w-20"
                                                size="sm"
                                                placeholder="Default"
                                                value={sq.marks_override ?? ''}
                                                onChange={(e) => onChangeMarks(sq.question_id, e.target.value === '' ? null : Number(e.target.value))}
                                            />
                                        </Td>
                                        <Td>
                                            <Button
                                                size="xs"
                                                variant="plain"
                                                className="text-red-500"
                                                icon={<TbTrash />}
                                                onClick={() => onRemoveQuestion(sq.question_id)}
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                )}
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

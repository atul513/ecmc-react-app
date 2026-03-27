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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiGetQuizCategories } from '@/services/QuizService'
import { apiGetSubjects, apiGetTopics, apiGetQuestions } from '@/services/QBankService'
import MathRichTextEditor from '@/components/shared/MathRichTextEditor'
import { TbPlus, TbTrash, TbSearch } from 'react-icons/tb'

const { THead, TBody, Tr, Th, Td } = Table

const STEP_TITLES = ['Details', 'Questions']

const ACCESS_OPTIONS = [{ value: 'free', label: 'Free' }, { value: 'paid', label: 'Paid' }]
const POINTS_MODE_OPTIONS = [
    { value: 'auto', label: 'Auto (system decides points)' },
    { value: 'manual', label: 'Manual (fixed points per question)' },
]
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
    { value: 'fill_blank', label: 'Fill in Blank' },
    { value: 'match_column', label: 'Match Column' },
]

const step1Schema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    category_id: z.any().nullable().optional(),
    subject_id: z.any().nullable().optional(),
    topic_id: z.any().nullable().optional(),
    access_type: z.string().default('free'),
    price: z.coerce.number().optional().nullable(),
    allow_reward_points: z.boolean().default(true),
    points_mode: z.string().default('auto'),
    points_per_question: z.coerce.number().optional().nullable(),
    show_reward_popup: z.boolean().default(true),
})

// ─── Step 1: Details ──────────────────────────────────────────────────────────
const StepDetails = ({ control, errors, categoryOptions, subjectOptions, topicOptions, onSubjectChange, watchAccessType, watchRewards, watchPointsMode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem label="Title *" className="md:col-span-2" invalid={!!errors.title} errorMessage={errors.title?.message}>
            <Controller name="title" control={control} render={({ field }) => (
                <Input {...field} placeholder="e.g. Newton's Laws Practice" />
            )} />
        </FormItem>

        <FormItem label="Description" className="md:col-span-2">
            <Controller name="description" control={control} render={({ field }) => (
                <MathRichTextEditor
                    content={field.value ?? ''}
                    onChange={(val) => field.onChange(typeof val === 'object' ? (val.html ?? '') : val)}
                    placeholder="Brief description of this practice set..."
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

        <FormItem label="Subject">
            <Controller name="subject_id" control={control} render={({ field }) => (
                <Select isClearable placeholder="Select subject" options={subjectOptions}
                    value={subjectOptions.find((o) => o.value === field.value) || null}
                    onChange={(opt) => { field.onChange(opt?.value || null); onSubjectChange(opt?.value || null) }} />
            )} />
        </FormItem>

        <FormItem label="Topic">
            <Controller name="topic_id" control={control} render={({ field }) => (
                <Select isClearable placeholder="Select topic" options={topicOptions}
                    value={topicOptions.find((o) => o.value === field.value) || null}
                    onChange={(opt) => field.onChange(opt?.value || null)} />
            )} />
        </FormItem>

        <FormItem label="Access Type">
            <Controller name="access_type" control={control} render={({ field }) => (
                <Select options={ACCESS_OPTIONS} value={ACCESS_OPTIONS.find((o) => o.value === field.value)}
                    onChange={(opt) => field.onChange(opt.value)} />
            )} />
        </FormItem>

        {watchAccessType === 'paid' && (
            <FormItem label="Price (₹)">
                <Controller name="price" control={control} render={({ field }) => (
                    <Input type="number" {...field} placeholder="0" />
                )} />
            </FormItem>
        )}

        {/* Reward Points */}
        <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-sm">Reward Points</p>
                    <p className="text-xs text-gray-400">Award points to students for correct answers</p>
                </div>
                <Controller name="allow_reward_points" control={control} render={({ field }) => (
                    <Switcher checked={field.value} onChange={field.onChange} />
                )} />
            </div>

            {watchRewards && (
                <>
                    <FormItem label="Points Mode">
                        <Controller name="points_mode" control={control} render={({ field }) => (
                            <Select options={POINTS_MODE_OPTIONS}
                                value={POINTS_MODE_OPTIONS.find((o) => o.value === field.value)}
                                onChange={(opt) => field.onChange(opt.value)} />
                        )} />
                    </FormItem>

                    {watchPointsMode === 'manual' && (
                        <FormItem label="Default Points per Question">
                            <Controller name="points_per_question" control={control} render={({ field }) => (
                                <Input type="number" {...field} placeholder="e.g. 5" className="w-40" />
                            )} />
                        </FormItem>
                    )}

                    <div className="flex items-center justify-between py-1">
                        <span className="text-sm">Show Reward Popup on correct answer</span>
                        <Controller name="show_reward_popup" control={control} render={({ field }) => (
                            <Switcher checked={field.value} onChange={field.onChange} />
                        )} />
                    </div>
                </>
            )}
        </div>
    </div>
)

// ─── Step 2: Questions ────────────────────────────────────────────────────────
const StepQuestions = ({ selectedQuestions, onAdd, onRemove, onChangePoints, watchPointsMode, watchRewards }) => {
    const [filters, setFilters] = useState({ search: '', type: '', difficulty: '', subject_id: '', topic_id: '' })
    const [qResults, setQResults] = useState([])
    const [qLoading, setQLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [subjects, setSubjects] = useState([])
    const [topics, setTopics] = useState([])

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
            const res = await apiGetTopics(val, {}).catch(() => null)
            setTopics(res?.data || [])
        } else {
            setTopics([])
        }
    }

    const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }))
    const selectedIds = useMemo(() => new Set(selectedQuestions.map((q) => q.question_id)), [selectedQuestions])

    const search = async () => {
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

    const showPointsOverride = watchRewards && watchPointsMode === 'manual'

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Search Question Bank</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    <Input prefix={<TbSearch />} placeholder="Keyword..." value={filters.search}
                        onChange={(e) => setFilter('search', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search() } }}
                        className="col-span-2 lg:col-span-2" />
                    <Select options={QUESTION_TYPE_OPTIONS} value={QUESTION_TYPE_OPTIONS.find((o) => o.value === filters.type)}
                        onChange={(opt) => setFilter('type', opt?.value ?? '')} placeholder="Type" />
                    <Select options={DIFFICULTY_OPTIONS} value={DIFFICULTY_OPTIONS.find((o) => o.value === filters.difficulty)}
                        onChange={(opt) => setFilter('difficulty', opt?.value ?? '')} placeholder="Difficulty" />
                    <Select options={subjectOptions} value={subjectOptions.find((o) => o.value === filters.subject_id)}
                        onChange={(opt) => handleSubjectChange(opt?.value ?? '')} placeholder="Subject" />
                    <Select options={topicOptions} value={topicOptions.find((o) => o.value === filters.topic_id)}
                        onChange={(opt) => setFilter('topic_id', opt?.value ?? '')}
                        placeholder="Topic" isDisabled={!filters.subject_id} />
                </div>
                <Button variant="solid" size="sm" icon={<TbSearch />} onClick={search} loading={qLoading}>Search</Button>

                {searched && (
                    <div className="mt-2 max-h-60 overflow-y-auto space-y-1 border-t border-gray-100 dark:border-gray-700 pt-2">
                        {qLoading ? (
                            <div className="flex justify-center py-4"><Spinner /></div>
                        ) : qResults.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-3">No questions found</p>
                        ) : qResults.map((q) => (
                            <div key={q.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm truncate"
                                        dangerouslySetInnerHTML={{ __html: q.question_text?.replace(/<[^>]+>/g, '').substring(0, 100) + '...' }} />
                                    <div className="flex gap-2 mt-0.5">
                                        <span className="text-xs text-gray-400 capitalize">{q.difficulty}</span>
                                        <span className="text-xs text-gray-400 uppercase">{q.type}</span>
                                        {q.subject?.name && <span className="text-xs text-gray-400">{q.subject.name}</span>}
                                    </div>
                                </div>
                                <Button size="xs" variant="solid" icon={<TbPlus />}
                                    disabled={selectedIds.has(q.id)} onClick={() => onAdd(q)} className="shrink-0">
                                    {selectedIds.has(q.id) ? 'Added' : 'Add'}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected */}
            <div>
                <p className="text-sm font-medium mb-2">Selected Questions ({selectedQuestions.length})</p>
                {selectedQuestions.length === 0 ? (
                    <div className="text-center text-gray-400 py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        No questions added yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Question</Th>
                                    <Th>Type</Th>
                                    <Th>Difficulty</Th>
                                    {showPointsOverride && <Th>Points Override</Th>}
                                    <Th></Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {selectedQuestions.map((sq, idx) => (
                                    <Tr key={sq.question_id}>
                                        <Td className="text-sm text-gray-400 w-8">{idx + 1}</Td>
                                        <Td>
                                            <div className="text-sm max-w-xs truncate"
                                                dangerouslySetInnerHTML={{ __html: sq._preview?.replace(/<[^>]+>/g, '').substring(0, 80) + '...' }} />
                                        </Td>
                                        <Td><span className="text-xs uppercase text-gray-500">{sq._type}</span></Td>
                                        <Td><span className="text-xs capitalize text-gray-500">{sq._difficulty}</span></Td>
                                        {showPointsOverride && (
                                            <Td>
                                                <Input type="number" size="sm" className="w-20"
                                                    placeholder="Default"
                                                    value={sq.points_override ?? ''}
                                                    onChange={(e) => onChangePoints(sq.question_id, e.target.value === '' ? null : Number(e.target.value))} />
                                            </Td>
                                        )}
                                        <Td>
                                            <Button size="xs" variant="plain" className="text-red-500"
                                                icon={<TbTrash />} onClick={() => onRemove(sq.question_id)} />
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

// ─── Main Form ────────────────────────────────────────────────────────────────
const PracticeSetForm = ({ initialData, onSubmit, submitting, serverErrors }) => {
    const [step, setStep] = useState(0)
    const [categories, setCategories] = useState([])
    const [subjects, setSubjects] = useState([])
    const [topics, setTopics] = useState([])
    const [selectedQuestions, setSelectedQuestions] = useState([])

    useEffect(() => {
        apiGetQuizCategories().then((res) => setCategories(res?.data || [])).catch(() => {})
        apiGetSubjects({ active_only: true }).then((res) => setSubjects(res?.data || [])).catch(() => {})
    }, [])

    useEffect(() => {
        if (initialData?.questions) {
            setSelectedQuestions(initialData.questions.map((q, idx) => ({
                question_id: q.question_id ?? q.id,
                sort_order: q.sort_order ?? idx,
                points_override: q.points_override ?? null,
                _preview: q._preview ?? q.question_text ?? '',
                _type: q._type ?? q.type ?? '',
                _difficulty: q._difficulty ?? q.difficulty ?? '',
            })))
        }
        if (initialData?.subject_id) {
            apiGetTopics(initialData.subject_id, {}).then((res) => setTopics(res?.data || [])).catch(() => {})
        }
    }, [initialData])

    const categoryOptions = useMemo(() => categories.map((c) => ({ value: c.id, label: c.name })), [categories])
    const subjectOptions = useMemo(() => subjects.map((s) => ({ value: s.id, label: s.name })), [subjects])
    const topicOptions = useMemo(() => topics.map((t) => ({ value: t.id, label: t.name })), [topics])

    const handleSubjectChange = async (val) => {
        if (val) {
            const res = await apiGetTopics(val, {}).catch(() => null)
            setTopics(res?.data || [])
        } else {
            setTopics([])
        }
    }

    const form = useForm({
        resolver: zodResolver(step1Schema),
        defaultValues: initialData ? {
            title: initialData.title ?? '',
            description: initialData.description ?? '',
            category_id: initialData.category_id ?? null,
            subject_id: initialData.subject_id ?? null,
            topic_id: initialData.topic_id ?? null,
            access_type: initialData.access_type ?? 'free',
            price: initialData.price ?? null,
            allow_reward_points: initialData.allow_reward_points ?? true,
            points_mode: initialData.points_mode ?? 'auto',
            points_per_question: initialData.points_per_question ?? null,
            show_reward_popup: initialData.show_reward_popup ?? true,
        } : {
            title: '', description: '', category_id: null, subject_id: null, topic_id: null,
            access_type: 'free', price: null, allow_reward_points: true,
            points_mode: 'auto', points_per_question: null, show_reward_popup: true,
        },
    })

    const watchAccessType = form.watch('access_type')
    const watchRewards = form.watch('allow_reward_points')
    const watchPointsMode = form.watch('points_mode')

    const addQuestion = (q) => {
        if (selectedQuestions.find((sq) => sq.question_id === q.id)) return
        setSelectedQuestions((prev) => [...prev, {
            question_id: q.id,
            sort_order: prev.length,
            points_override: null,
            _preview: q.question_text ?? '',
            _type: q.type ?? '',
            _difficulty: q.difficulty ?? '',
        }])
    }

    const removeQuestion = (qid) => {
        setSelectedQuestions((prev) =>
            prev.filter((q) => q.question_id !== qid).map((q, i) => ({ ...q, sort_order: i }))
        )
    }

    const changePoints = (qid, val) => {
        setSelectedQuestions((prev) =>
            prev.map((q) => q.question_id === qid ? { ...q, points_override: val } : q)
        )
    }

    const goNext = async () => {
        const valid = await form.trigger()
        if (!valid) return
        setStep(1)
    }

    const handleFinalSubmit = async () => {
        const valid = await form.trigger()
        if (!valid) {
            toast.push(<Notification type="warning" title="Please fix errors in the Details step" />, { placement: 'top-center' })
            return
        }
        const values = form.getValues()
        const payload = {
            ...values,
            questions: selectedQuestions.map(({ question_id, sort_order, points_override }) => ({
                question_id,
                sort_order,
                ...(points_override != null ? { points_override } : {}),
            })),
        }
        onSubmit(payload)
    }

    const serverErrorList = serverErrors
        ? Object.entries(serverErrors).flatMap(([field, msgs]) =>
            Array.isArray(msgs) ? msgs.map((m) => `${field}: ${m}`) : [`${field}: ${msgs}`]
        )
        : []

    return (
        <div className="space-y-6">
            {/* Steps — desktop */}
            <div className="hidden sm:block">
                <Steps current={step}>
                    {STEP_TITLES.map((t, i) => <Steps.Item key={i} title={t} />)}
                </Steps>
            </div>
            {/* Steps — mobile */}
            <div className="sm:hidden">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Step {step + 1} of {STEP_TITLES.length}</span>
                    <span className="text-sm text-gray-500">{STEP_TITLES[step]}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }} />
                </div>
            </div>

            {/* Server errors */}
            {serverErrorList.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="font-semibold text-red-700 dark:text-red-400 text-sm mb-2">Please fix the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {serverErrorList.map((msg, i) => <li key={i} className="text-sm text-red-600 dark:text-red-300">{msg}</li>)}
                    </ul>
                </div>
            )}

            {/* Content */}
            <div className="min-h-64">
                {step === 0 && (
                    <Form>
                        <StepDetails
                            control={form.control}
                            errors={form.formState.errors}
                            categoryOptions={categoryOptions}
                            subjectOptions={subjectOptions}
                            topicOptions={topicOptions}
                            onSubjectChange={handleSubjectChange}
                            watchAccessType={watchAccessType}
                            watchRewards={watchRewards}
                            watchPointsMode={watchPointsMode}
                        />
                    </Form>
                )}
                {step === 1 && (
                    <StepQuestions
                        selectedQuestions={selectedQuestions}
                        onAdd={addQuestion}
                        onRemove={removeQuestion}
                        onChangePoints={changePoints}
                        watchPointsMode={watchPointsMode}
                        watchRewards={watchRewards}
                    />
                )}
            </div>

            {/* Nav */}
            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button variant="plain" disabled={step === 0} onClick={() => setStep(0)}>Back</Button>
                <div className="flex gap-2">
                    {step === 0 ? (
                        <Button variant="solid" onClick={goNext}>Next</Button>
                    ) : (
                        <Button variant="solid" loading={submitting} onClick={handleFinalSubmit}>
                            {submitting ? 'Saving...' : 'Save Practice Set'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PracticeSetForm

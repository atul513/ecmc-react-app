import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import { Form, FormItem } from '@/components/ui/Form'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import MathRichTextEditor from '@/components/shared/MathRichTextEditor'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiGetSubjects, apiGetTopics, apiGetTags } from '@/services/QBankService'
import { TbPlus, TbTrash, TbGripVertical } from 'react-icons/tb'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'

const TYPE_OPTIONS = [
    { value: 'mcq', label: 'MCQ (Single Correct)' },
    { value: 'multi_select', label: 'Multi-Select (Multiple Correct)' },
    { value: 'true_false', label: 'True / False' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'long_answer', label: 'Long Answer' },
    { value: 'fill_blank', label: 'Fill in the Blank' },
    { value: 'match_column', label: 'Match the Column' },
]

const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
]

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Submit for Review' },
    { value: 'approved', label: 'Approved' },
]

const schema = z.object({
    subject_id: z.any().refine((v) => !!v, 'Subject is required'),
    topic_id: z.any().nullable().optional(),
    type: z.string().min(1, 'Type is required'),
    difficulty: z.string().min(1, 'Difficulty is required'),
    question_text: z.string().min(1, 'Question text is required'),
    marks: z.coerce.number().min(0, 'Marks required'),
    negative_marks: z.coerce.number().optional(),
    time_limit_sec: z.coerce.number().optional(),
    language: z.string().optional(),
    source: z.string().optional(),
    explanation: z.string().optional(),
    solution_approach: z.string().optional(),
    status: z.string().optional(),
    tags: z.string().optional(),
    // Options (MCQ, Multi-Select, True/False)
    options: z.array(z.object({
        option_text: z.string(),
        is_correct: z.boolean().default(false),
        sort_order: z.coerce.number().default(0),
        explanation: z.string().optional(),
    })).optional(),
    // Short/Long answer
    expected_answer: z.object({
        answer_text: z.string().optional(),
        keywords: z.string().optional(),
        min_words: z.coerce.number().optional(),
        max_words: z.coerce.number().optional(),
    }).optional(),
    // Fill in the blank
    blanks: z.array(z.object({
        blank_number: z.coerce.number(),
        correct_answers: z.string(),
        is_case_sensitive: z.boolean().default(false),
    })).optional(),
    // Match the column
    match_pairs: z.array(z.object({
        column_a_text: z.string(),
        column_b_text: z.string(),
        sort_order: z.coerce.number().default(0),
    })).optional(),
})

const defaultOption = () => ({ option_text: '', is_correct: false, sort_order: 0, explanation: '' })
const defaultBlank = (n) => ({ blank_number: n, correct_answers: '', is_case_sensitive: false })
const defaultPair = (n) => ({ column_a_text: '', column_b_text: '', sort_order: n })

// ─── Option Rows (MCQ / Multi-Select) ─────────────────────────────────────────
const OptionsEditor = ({ control, isSingle }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'options' })
    return (
        <div className="flex flex-col gap-4">
            {fields.map((field, idx) => (
                <div key={field.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <TbGripVertical className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-500">Option {idx + 1}</span>
                        <Controller
                            name={`options.${idx}.is_correct`}
                            control={control}
                            render={({ field: f }) => (
                                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer ml-2">
                                    <input
                                        type={isSingle ? 'radio' : 'checkbox'}
                                        checked={f.value}
                                        onChange={() => f.onChange(!f.value)}
                                        className="accent-emerald-500 w-3.5 h-3.5"
                                    />
                                    <span className={f.value ? 'text-emerald-600' : 'text-gray-500'}>
                                        {f.value ? 'Correct Answer' : 'Mark as Correct'}
                                    </span>
                                </label>
                            )}
                        />
                        <button type="button" className="ml-auto text-red-400 hover:text-red-600 p-1" onClick={() => remove(idx)}>
                            <TbTrash size={15} />
                        </button>
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                        <Controller
                            name={`options.${idx}.option_text`}
                            control={control}
                            render={({ field: f }) => (
                                <MathRichTextEditor
                                    compact
                                    content={f.value || ''}
                                    onChange={({ html }) => f.onChange(html)}
                                    placeholder={`Option ${idx + 1} — supports math ($x^2$) and images`}
                                />
                            )}
                        />
                        <Controller
                            name={`options.${idx}.explanation`}
                            control={control}
                            render={({ field: f }) => (
                                <Input
                                    {...f}
                                    size="sm"
                                    placeholder="Explanation for this option (optional)"
                                />
                            )}
                        />
                    </div>
                </div>
            ))}
            <Button type="button" size="sm" icon={<TbPlus />} onClick={() => append(defaultOption())}>
                Add Option
            </Button>
        </div>
    )
}

// ─── Blanks Editor ─────────────────────────────────────────────────────────────
const BlanksEditor = ({ control }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'blanks' })
    return (
        <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-500">Use {'{{1}}'}, {'{{2}}'} etc. in the question text to mark blank positions.</p>
            {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-sm font-medium text-gray-500 w-16">Blank {idx + 1}</span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Controller
                            name={`blanks.${idx}.correct_answers`}
                            control={control}
                            render={({ field: f }) => <Input {...f} placeholder="Correct answers (comma-separated)" />}
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <Controller
                                name={`blanks.${idx}.is_case_sensitive`}
                                control={control}
                                render={({ field: f }) => <Switcher checked={f.value} onChange={f.onChange} />}
                            />
                            Case sensitive
                        </label>
                    </div>
                    <button type="button" className="text-red-400 hover:text-red-600" onClick={() => remove(idx)}>
                        <TbTrash size={16} />
                    </button>
                </div>
            ))}
            <Button type="button" size="sm" icon={<TbPlus />} onClick={() => append(defaultBlank(fields.length + 1))}>
                Add Blank
            </Button>
        </div>
    )
}

// ─── Match Pairs Editor ────────────────────────────────────────────────────────
const MatchPairsEditor = ({ control }) => {
    const { fields, append, remove } = useFieldArray({ control, name: 'match_pairs' })
    return (
        <div className="flex flex-col gap-3">
            {fields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <span className="text-sm text-gray-400 w-8">{idx + 1}</span>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                        <Controller
                            name={`match_pairs.${idx}.column_a_text`}
                            control={control}
                            render={({ field: f }) => <Input {...f} placeholder="Column A" />}
                        />
                        <Controller
                            name={`match_pairs.${idx}.column_b_text`}
                            control={control}
                            render={({ field: f }) => <Input {...f} placeholder="Column B (matches A)" />}
                        />
                    </div>
                    <button type="button" className="text-red-400 hover:text-red-600" onClick={() => remove(idx)}>
                        <TbTrash size={16} />
                    </button>
                </div>
            ))}
            <Button type="button" size="sm" icon={<TbPlus />} onClick={() => append(defaultPair(fields.length))}>
                Add Pair
            </Button>
        </div>
    )
}

// ─── Main Form ─────────────────────────────────────────────────────────────────
const QuestionForm = ({ initialValues, onSubmit, saving }) => {
    const navigate = useNavigate()
    const [subjects, setSubjects] = useState([])
    const [topics, setTopics] = useState([])
    const [tagOptions, setTagOptions] = useState([])

    const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: initialValues || {
            subject_id: null,
            topic_id: null,
            type: 'mcq',
            difficulty: 'medium',
            question_text: '',
            marks: 1,
            negative_marks: 0,
            time_limit_sec: 60,
            language: 'en',
            source: '',
            explanation: '',
            solution_approach: '',
            status: 'draft',
            tags: '',
            options: [defaultOption(), defaultOption(), defaultOption(), defaultOption()],
            expected_answer: { answer_text: '', keywords: '', min_words: 0, max_words: 0 },
            blanks: [defaultBlank(1)],
            match_pairs: [defaultPair(0), defaultPair(1)],
        },
    })

    const questionType = watch('type')
    const selectedSubjectId = watch('subject_id')

    useEffect(() => {
        if (initialValues) reset(initialValues)
    }, [initialValues, reset])

    useEffect(() => {
        apiGetSubjects({ active_only: true }).then((res) => {
            setSubjects((res?.data || []).map((s) => ({ value: s.id, label: s.name })))
        }).catch(() => {})
        apiGetTags().then((res) => {
            setTagOptions((res?.data || []).map((t) => ({ value: t.slug, label: t.name })))
        }).catch(() => {})
    }, [])

    useEffect(() => {
        if (selectedSubjectId) {
            apiGetTopics(selectedSubjectId, { active_only: true }).then((res) => {
                setTopics((res?.data || []).map((t) => ({ value: t.id, label: t.name })))
            }).catch(() => {})
        } else {
            setTopics([])
        }
    }, [selectedSubjectId])

    // Auto-set True/False options
    useEffect(() => {
        if (questionType === 'true_false') {
            setValue('options', [
                { option_text: 'True', is_correct: true, sort_order: 0, explanation: '' },
                { option_text: 'False', is_correct: false, sort_order: 1, explanation: '' },
            ])
        }
    }, [questionType, setValue])

    const submit = (values) => {
        // Transform tags string to array
        const tagsArr = values.tags
            ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : []

        // Transform expected_answer keywords string to array
        let expectedAnswer = values.expected_answer
        if (expectedAnswer?.keywords) {
            expectedAnswer = {
                ...expectedAnswer,
                keywords: expectedAnswer.keywords.split(',').map((k) => k.trim()).filter(Boolean),
            }
        }

        // Transform blanks correct_answers string to array
        const blanks = (values.blanks || []).map((b) => ({
            ...b,
            correct_answers: b.correct_answers.split(',').map((a) => a.trim()).filter(Boolean),
        }))

        const payload = {
            subject_id: values.subject_id,
            topic_id: values.topic_id || null,
            type: values.type,
            difficulty: values.difficulty,
            question_text: values.question_text,
            marks: values.marks,
            negative_marks: values.negative_marks || 0,
            time_limit_sec: values.time_limit_sec || null,
            language: values.language || 'en',
            source: values.source || null,
            explanation: values.explanation || null,
            solution_approach: values.solution_approach || null,
            status: values.status || 'draft',
            tags: tagsArr,
        }

        if (['mcq', 'multi_select', 'true_false'].includes(values.type)) {
            payload.options = values.options
        }
        if (['short_answer', 'long_answer'].includes(values.type)) {
            payload.expected_answer = expectedAnswer
        }
        if (values.type === 'fill_blank') {
            payload.blanks = blanks
        }
        if (values.type === 'match_column') {
            payload.match_pairs = values.match_pairs
        }

        onSubmit(payload)
    }

    return (
        <Form onSubmit={handleSubmit(submit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Main content */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Basic Info */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h6 className="font-semibold mb-4">Question Details</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <FormItem label="Subject *" invalid={!!errors.subject_id} errorMessage={errors.subject_id?.message}>
                                <Controller
                                    name="subject_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={subjects}
                                            placeholder="Select subject"
                                            value={subjects.find((o) => o.value === field.value) || null}
                                            onChange={(opt) => { field.onChange(opt?.value || null); setValue('topic_id', null) }}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Topic">
                                <Controller
                                    name="topic_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            isClearable
                                            options={topics}
                                            placeholder="Select topic"
                                            value={topics.find((o) => o.value === field.value) || null}
                                            onChange={(opt) => field.onChange(opt?.value || null)}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <FormItem label="Question Type *" invalid={!!errors.type} errorMessage={errors.type?.message}>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={TYPE_OPTIONS}
                                            value={TYPE_OPTIONS.find((o) => o.value === field.value)}
                                            onChange={(opt) => field.onChange(opt?.value)}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Difficulty *" invalid={!!errors.difficulty} errorMessage={errors.difficulty?.message}>
                                <Controller
                                    name="difficulty"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={DIFFICULTY_OPTIONS}
                                            value={DIFFICULTY_OPTIONS.find((o) => o.value === field.value)}
                                            onChange={(opt) => field.onChange(opt?.value)}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                        <FormItem label="Question Text *" invalid={!!errors.question_text} errorMessage={errors.question_text?.message}>
                            <Controller
                                name="question_text"
                                control={control}
                                render={({ field }) => (
                                    <MathRichTextEditor
                                        content={field.value || ''}
                                        invalid={!!errors.question_text}
                                        placeholder={
                                            questionType === 'fill_blank'
                                                ? 'Use {{1}}, {{2}} to mark blanks. e.g. "The {{1}} is the largest planet."'
                                                : 'Enter the question... Use $x^2$ for inline math or $$...$$ for display math'
                                        }
                                        onChange={({ html }) => field.onChange(html)}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>

                    {/* Type-specific answer section */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h6 className="font-semibold mb-4">
                            {['mcq', 'multi_select', 'true_false'].includes(questionType) && 'Answer Options'}
                            {['short_answer', 'long_answer'].includes(questionType) && 'Expected Answer'}
                            {questionType === 'fill_blank' && 'Blanks & Answers'}
                            {questionType === 'match_column' && 'Match Pairs'}
                        </h6>

                        {questionType === 'mcq' && <OptionsEditor control={control} isSingle />}
                        {questionType === 'multi_select' && <OptionsEditor control={control} isSingle={false} />}
                        {questionType === 'true_false' && <OptionsEditor control={control} isSingle />}
                        {questionType === 'fill_blank' && <BlanksEditor control={control} />}
                        {questionType === 'match_column' && <MatchPairsEditor control={control} />}

                        {['short_answer', 'long_answer'].includes(questionType) && (
                            <div className="flex flex-col gap-4">
                                <FormItem label="Answer Text">
                                    <Controller
                                        name="expected_answer.answer_text"
                                        control={control}
                                        render={({ field }) => (
                                            <MathRichTextEditor
                                                content={field.value || ''}
                                                onChange={({ html }) => field.onChange(html)}
                                                placeholder="Model answer... Use $x^2$ for math"
                                            />
                                        )}
                                    />
                                </FormItem>
                                <FormItem label="Keywords (comma-separated)">
                                    <Controller
                                        name="expected_answer.keywords"
                                        control={control}
                                        render={({ field }) => <Input {...field} placeholder="e.g. photosynthesis, chlorophyll, ATP" />}
                                    />
                                </FormItem>
                                {questionType === 'long_answer' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormItem label="Min Words">
                                            <Controller name="expected_answer.min_words" control={control} render={({ field }) => <Input type="number" {...field} />} />
                                        </FormItem>
                                        <FormItem label="Max Words">
                                            <Controller name="expected_answer.max_words" control={control} render={({ field }) => <Input type="number" {...field} />} />
                                        </FormItem>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h6 className="font-semibold mb-4">Explanation & Solution</h6>
                        <FormItem label="Explanation">
                            <Controller
                                name="explanation"
                                control={control}
                                render={({ field }) => (
                                    <MathRichTextEditor
                                        content={field.value || ''}
                                        onChange={({ html }) => field.onChange(html)}
                                        placeholder="Explain the correct answer..."
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem label="Solution Approach">
                            <Controller
                                name="solution_approach"
                                control={control}
                                render={({ field }) => (
                                    <MathRichTextEditor
                                        content={field.value || ''}
                                        onChange={({ html }) => field.onChange(html)}
                                        placeholder="Step-by-step solution approach..."
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                </div>

                {/* Right: Settings */}
                <div className="flex flex-col gap-4">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h6 className="font-semibold mb-4">Scoring & Settings</h6>
                        <FormItem label="Marks *">
                            <Controller name="marks" control={control} render={({ field }) => <Input type="number" step="0.5" {...field} />} />
                        </FormItem>
                        <FormItem label="Negative Marks">
                            <Controller name="negative_marks" control={control} render={({ field }) => <Input type="number" step="0.25" {...field} />} />
                        </FormItem>
                        <FormItem label="Time Limit (seconds)">
                            <Controller name="time_limit_sec" control={control} render={({ field }) => <Input type="number" {...field} />} />
                        </FormItem>
                        <FormItem label="Language">
                            <Controller name="language" control={control} render={({ field }) => <Input {...field} placeholder="en" />} />
                        </FormItem>
                        <FormItem label="Source">
                            <Controller name="source" control={control} render={({ field }) => <Input {...field} placeholder="e.g. NCERT Class 11, Ch 5" />} />
                        </FormItem>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h6 className="font-semibold mb-4">Tags</h6>
                        <FormItem label="Tags (comma-separated slugs)">
                            <Controller
                                name="tags"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        textArea
                                        rows={2}
                                        {...field}
                                        placeholder="e.g. neet-2025, mechanics, pyq"
                                    />
                                )}
                            />
                        </FormItem>
                        {tagOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {tagOptions.slice(0, 12).map((t) => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                        onClick={() => {
                                            const cur = control._formValues.tags || ''
                                            const arr = cur.split(',').map((x) => x.trim()).filter(Boolean)
                                            if (!arr.includes(t.value)) {
                                                setValue('tags', [...arr, t.value].join(', '))
                                            }
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <h6 className="font-semibold mb-4">Status</h6>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={STATUS_OPTIONS}
                                    value={STATUS_OPTIONS.find((o) => o.value === field.value)}
                                    onChange={(opt) => field.onChange(opt?.value)}
                                />
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button type="submit" variant="solid" loading={saving} className="w-full">
                            Save Question
                        </Button>
                        <Button type="button" className="w-full" onClick={() => navigate(`${ECMC_PREFIX_PATH}/qbank/questions`)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </Form>
    )
}

export default QuestionForm

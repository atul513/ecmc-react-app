import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import QuestionForm from './components/QuestionForm'
import { apiGetQuestion, apiUpdateQuestion } from '@/services/QBankService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'

const mapToFormValues = (q) => {
    if (!q) return null
    return {
        subject_id: q.subject_id || q.subject?.id || null,
        topic_id: q.topic_id || q.topic?.id || null,
        type: q.type || 'mcq',
        difficulty: q.difficulty || 'medium',
        question_text: q.question_text || '',
        marks: q.marks ?? 1,
        negative_marks: q.negative_marks ?? 0,
        time_limit_sec: q.time_limit_sec ?? 60,
        language: q.language || 'en',
        source: q.source || '',
        explanation: q.explanation || '',
        solution_approach: q.solution_approach || '',
        status: q.status || 'draft',
        tags: Array.isArray(q.tags)
            ? q.tags.map((t) => (typeof t === 'object' ? t.slug || t.name || '' : t)).join(', ')
            : (q.tags || ''),
        options: (q.options || []).map((o) => ({
            option_text: o.option_text || '',
            is_correct: !!o.is_correct,
            sort_order: o.sort_order ?? 0,
            explanation: o.explanation || '',
        })),
        expected_answer: {
            answer_text: q.expected_answer?.answer_text || '',
            keywords: Array.isArray(q.expected_answer?.keywords)
                ? q.expected_answer.keywords.join(', ')
                : (q.expected_answer?.keywords || ''),
            min_words: q.expected_answer?.min_words ?? 0,
            max_words: q.expected_answer?.max_words ?? 0,
        },
        blanks: (q.blanks || []).map((b) => ({
            blank_number: b.blank_number,
            correct_answers: Array.isArray(b.correct_answers)
                ? b.correct_answers.join(', ')
                : (b.correct_answers || ''),
            is_case_sensitive: !!b.is_case_sensitive,
        })),
        match_pairs: (q.match_pairs || []).map((p, i) => ({
            column_a_text: p.column_a_text || '',
            column_b_text: p.column_b_text || '',
            sort_order: p.sort_order ?? i,
        })),
    }
}

const QuestionEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [initialValues, setInitialValues] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiGetQuestion(id)
                setInitialValues(mapToFormValues(res?.data || res))
            } catch {
                toast.push(<Notification type="danger" title="Failed to load question" />, { placement: 'top-center' })
                navigate(`${ECMC_PREFIX_PATH}/qbank/questions`)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleSubmit = async (payload) => {
        setSaving(true)
        try {
            await apiUpdateQuestion(id, payload)
            toast.push(<Notification type="success" title="Question updated" />, { placement: 'top-center' })
            navigate(`${ECMC_PREFIX_PATH}/qbank/questions`)
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to update question'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center py-20"><Spinner size="40px" /></div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="mb-4">
                <h3 className="text-xl font-semibold">Edit Question</h3>
                <p className="text-sm text-gray-500 mt-1">Update question details — ID: {id}</p>
            </div>
            <AdaptiveCard>
                <QuestionForm initialValues={initialValues} onSubmit={handleSubmit} saving={saving} />
            </AdaptiveCard>
        </Container>
    )
}

export default QuestionEdit

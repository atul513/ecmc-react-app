import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { apiGetQuiz, apiUpdateQuiz, apiGetQuizQuestions, apiGetQuizSchedules } from '@/services/QuizService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import QuizForm from './QuizForm'
import LinkedSections from '@/components/shared/LinkedSections'

const QuizEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [initialData, setInitialData] = useState(null)
    const [linkedSections, setLinkedSections] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [serverErrors, setServerErrors] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                const [quizRes, questionsRes, schedulesRes] = await Promise.all([
                    apiGetQuiz(id),
                    apiGetQuizQuestions(id),
                    apiGetQuizSchedules(id),
                ])
                const quiz = quizRes?.data
                const questions = questionsRes?.data || []
                const schedules = schedulesRes?.data || []
                // sections come from quiz detail response
                const rawSections = quiz?.sections || []

                // exam sections this quiz is linked to
                setLinkedSections(quiz?.exam_sections || [])

                setInitialData({
                    ...quiz,
                    sections: rawSections.map((s) => ({
                        _key: String(s.id),
                        id: s.id,
                        title: s.title ?? '',
                        instructions: s.instructions ?? '',
                        sort_order: s.sort_order ?? 0,
                    })),
                    questions: questions.map((q) => ({
                        question_id: q.question_id ?? q.id,
                        sort_order: q.sort_order ?? 0,
                        marks_override: q.marks_override ?? null,
                        _sectionKey: q.section_id ? String(q.section_id) : '',
                        _preview: q.question_text ?? q.question?.question_text ?? '',
                        _difficulty: q.difficulty ?? q.question?.difficulty ?? '',
                    })),
                    schedules: schedules.map((s) => ({
                        title: s.title ?? '',
                        starts_at: s.starts_at ?? null,
                        ends_at: s.ends_at ?? null,
                        grace_period_min: s.grace_period_min ?? 0,
                    })),
                })
            } catch {
                toast.push(<Notification type="danger" title="Failed to load quiz" />, { placement: 'top-center' })
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleSubmit = async (payload) => {
        setSubmitting(true)
        setServerErrors(null)
        try {
            await apiUpdateQuiz(id, payload)
            toast.push(<Notification type="success" title="Quiz updated successfully" />, { placement: 'top-center' })
            navigate(`${ECMC_PREFIX_PATH}/quiz`)
        } catch (err) {
            const errors = err?.response?.data?.errors
            const message = err?.response?.data?.message
            if (errors) {
                setServerErrors(errors)
            } else {
                toast.push(<Notification type="danger" title={message ?? 'Failed to update quiz'} />, { placement: 'top-center' })
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <Container>
                <AdaptiveCard>
                    <div className="flex justify-center py-16"><Spinner size="40px" /></div>
                </AdaptiveCard>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex flex-col gap-6">
                <AdaptiveCard>
                    <h3 className="text-lg font-semibold mb-6">Edit Quiz / Exam</h3>
                    <div className="max-w-4xl mx-auto px-0 lg:px-8">
                        <QuizForm initialData={initialData} onSubmit={handleSubmit} submitting={submitting} serverErrors={serverErrors} />
                    </div>
                </AdaptiveCard>

                <LinkedSections
                    contentId={Number(id)}
                    linkableType="quiz"
                    initialSections={linkedSections}
                />
            </div>
        </Container>
    )
}

export default QuizEdit

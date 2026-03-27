import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { apiGetPracticeSet, apiGetPracticeSetQuestions, apiUpdatePracticeSet } from '@/services/PracticeSetService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import PracticeSetForm from './PracticeSetForm'

const PracticeSetEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [initialData, setInitialData] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [serverErrors, setServerErrors] = useState(null)

    useEffect(() => {
        const load = async () => {
            try {
                const [setRes, questionsRes] = await Promise.all([
                    apiGetPracticeSet(id),
                    apiGetPracticeSetQuestions(id),
                ])
                const ps = setRes?.data
                const questions = questionsRes?.data || []
                setInitialData({
                    ...ps,
                    questions: questions.map((q, idx) => ({
                        question_id: q.question_id ?? q.id,
                        sort_order: q.sort_order ?? idx,
                        points_override: q.points_override ?? null,
                        _preview: q.question_text ?? q.question?.question_text ?? '',
                        _type: q.type ?? q.question?.type ?? '',
                        _difficulty: q.difficulty ?? q.question?.difficulty ?? '',
                    })),
                })
            } catch {
                toast.push(<Notification type="danger" title="Failed to load practice set" />, { placement: 'top-center' })
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
            await apiUpdatePracticeSet(id, payload)
            toast.push(<Notification type="success" title="Practice set updated" />, { placement: 'top-center' })
            navigate(`${ECMC_PREFIX_PATH}/practice`)
        } catch (err) {
            const errors = err?.response?.data?.errors
            const message = err?.response?.data?.message
            if (errors) {
                setServerErrors(errors)
            } else {
                toast.push(<Notification type="danger" title={message ?? 'Failed to update practice set'} />, { placement: 'top-center' })
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
            <AdaptiveCard>
                <h3 className="text-lg font-semibold mb-6">Edit Practice Set</h3>
                <div className="max-w-4xl mx-auto px-0 lg:px-8">
                    <PracticeSetForm initialData={initialData} onSubmit={handleSubmit} submitting={submitting} serverErrors={serverErrors} />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default PracticeSetEdit

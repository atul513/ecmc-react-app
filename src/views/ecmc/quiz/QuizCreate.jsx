import { useState } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { apiCreateQuiz } from '@/services/QuizService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import QuizForm from './QuizForm'

const QuizCreate = () => {
    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)
    const [serverErrors, setServerErrors] = useState(null)

    const handleSubmit = async (payload) => {
        setSubmitting(true)
        setServerErrors(null)
        try {
            await apiCreateQuiz(payload)
            toast.push(<Notification type="success" title="Quiz created successfully" />, { placement: 'top-center' })
            navigate(`${ECMC_PREFIX_PATH}/quiz`)
        } catch (err) {
            const errors = err?.response?.data?.errors
            const message = err?.response?.data?.message
            if (errors) {
                setServerErrors(errors)
            } else {
                toast.push(<Notification type="danger" title={message ?? 'Failed to create quiz'} />, { placement: 'top-center' })
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Container>
            <AdaptiveCard>
                <h3 className="text-lg font-semibold mb-6">Create Quiz / Exam</h3>
                <div className="max-w-4xl mx-auto px-0 lg:px-8">
                    <QuizForm onSubmit={handleSubmit} submitting={submitting} serverErrors={serverErrors} />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default QuizCreate

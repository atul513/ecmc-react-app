import { useState } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import QuestionForm from './components/QuestionForm'
import { apiCreateQuestion } from '@/services/QBankService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'

const QuestionCreate = () => {
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (payload) => {
        setSaving(true)
        try {
            await apiCreateQuestion(payload)
            toast.push(<Notification type="success" title="Question created successfully" />, { placement: 'top-center' })
            navigate(`${ECMC_PREFIX_PATH}/qbank/questions`)
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to create question'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Container>
            <div className="mb-4">
                <h3 className="text-xl font-semibold">Create Question</h3>
                <p className="text-sm text-gray-500 mt-1">Add a new question to the question bank</p>
            </div>
            <AdaptiveCard>
                <QuestionForm onSubmit={handleSubmit} saving={saving} />
            </AdaptiveCard>
        </Container>
    )
}

export default QuestionCreate

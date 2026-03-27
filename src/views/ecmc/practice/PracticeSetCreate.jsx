import { useState } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { apiCreatePracticeSet } from '@/services/PracticeSetService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import PracticeSetForm from './PracticeSetForm'

const PracticeSetCreate = () => {
    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)
    const [serverErrors, setServerErrors] = useState(null)

    const handleSubmit = async (payload) => {
        setSubmitting(true)
        setServerErrors(null)
        try {
            await apiCreatePracticeSet(payload)
            toast.push(<Notification type="success" title="Practice set created successfully" />, { placement: 'top-center' })
            navigate(`${ECMC_PREFIX_PATH}/practice`)
        } catch (err) {
            const errors = err?.response?.data?.errors
            const message = err?.response?.data?.message
            if (errors) {
                setServerErrors(errors)
            } else {
                toast.push(<Notification type="danger" title={message ?? 'Failed to create practice set'} />, { placement: 'top-center' })
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Container>
            <AdaptiveCard>
                <h3 className="text-lg font-semibold mb-6">Create Practice Set</h3>
                <div className="max-w-4xl mx-auto px-0 lg:px-8">
                    <PracticeSetForm onSubmit={handleSubmit} submitting={submitting} serverErrors={serverErrors} />
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default PracticeSetCreate

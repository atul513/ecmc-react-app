import { useState } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import BlogForm from './components/BlogForm'
import { apiCreateBlog } from '@/services/BlogService'
import { TbArrowLeft } from 'react-icons/tb'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'

const BlogCreate = () => {
    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (values) => {
        setSubmitting(true)
        try {
            await apiCreateBlog(values)
            toast.push(
                <Notification type="success" title="Blog post created successfully" />,
                { placement: 'top-center' }
            )
            navigate(`${ECMC_PREFIX_PATH}/blog`)
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to create blog post'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Container>
            <div className="flex items-center gap-3 mb-6">
                <Button
                    icon={<TbArrowLeft />}
                    variant="plain"
                    onClick={() => navigate(`${ECMC_PREFIX_PATH}/blog`)}
                />
                <h3 className="text-lg font-semibold">Create New Blog Post</h3>
            </div>
            <BlogForm onSubmit={handleSubmit} submitting={submitting} />
        </Container>
    )
}

export default BlogCreate

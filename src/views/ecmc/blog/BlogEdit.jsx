import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import Container from '@/components/shared/Container'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Button from '@/components/ui/Button'
import BlogForm from './components/BlogForm'
import { apiGetBlog, apiUpdateBlog } from '@/services/BlogService'
import { TbArrowLeft } from 'react-icons/tb'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'

const BlogEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams()

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [initialValues, setInitialValues] = useState(null)

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await apiGetBlog(id)
                const blog = res?.data?.data || res?.data || res
                // Normalize content (legacy posts might have it stored as object)
                let content = blog.content
                if (content && typeof content === 'object') {
                    content = content.html ?? ''
                }
                // Map category and tags to Select format
                setInitialValues({
                    ...blog,
                    content: content ?? '',
                    category_id: blog.category
                        ? { value: blog.category.id, label: blog.category.name }
                        : null,
                    tags: blog.tags?.map((t) => ({ value: t.id, label: t.name })) || [],
                })
            } catch {
                toast.push(
                    <Notification type="danger" title="Failed to load blog post" />,
                    { placement: 'top-center' }
                )
                navigate(`${ECMC_PREFIX_PATH}/blog`)
            } finally {
                setLoading(false)
            }
        }
        fetchBlog()
    }, [id, navigate])

    const handleSubmit = async (values) => {
        setSubmitting(true)
        try {
            await apiUpdateBlog(id, values)
            toast.push(
                <Notification type="success" title="Blog post updated successfully" />,
                { placement: 'top-center' }
            )
            navigate(`${ECMC_PREFIX_PATH}/blog`)
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to update blog post'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <Container>
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="flex items-center gap-3 mb-6">
                <Button
                    icon={<TbArrowLeft />}
                    variant="plain"
                    onClick={() => navigate(`${ECMC_PREFIX_PATH}/blog`)}
                />
                <h3 className="text-lg font-semibold">Edit Blog Post</h3>
            </div>
            {initialValues && (
                <BlogForm
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                />
            )}
        </Container>
    )
}

export default BlogEdit

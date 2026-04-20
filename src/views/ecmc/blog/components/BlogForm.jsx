import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import RichTextEditor from '@/components/shared/RichTextEditor'
import { apiGetBlogCategories, apiGetBlogTags } from '@/services/BlogService'

const { TabNav, TabList, TabContent } = Tabs

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    status: z.string().default('draft'),
    category_id: z.any().optional(),
    tags: z.array(z.any()).optional(),
    is_featured: z.boolean().default(false),
    is_comments_enabled: z.boolean().default(true),
    featured_image: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
    og_title: z.string().optional(),
    og_description: z.string().optional(),
    og_image: z.string().optional(),
    published_at: z.string().optional(),
})

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'archived', label: 'Archived' },
]

const BlogForm = ({ initialValues = {}, onSubmit, submitting = false }) => {
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            status: 'draft',
            category_id: null,
            tags: [],
            is_featured: false,
            is_comments_enabled: true,
            featured_image: '',
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
            og_title: '',
            og_description: '',
            og_image: '',
            published_at: '',
            ...initialValues,
        },
        resolver: zodResolver(schema),
    })

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [catRes, tagRes] = await Promise.all([
                    apiGetBlogCategories({ per_page: 100 }),
                    apiGetBlogTags({ per_page: 100 }),
                ])
                const cats = catRes?.data?.data || catRes?.data || []
                const tgs = tagRes?.data?.data || tagRes?.data || []
                setCategories(cats.map((c) => ({ value: c.id, label: c.name })))
                setTags(tgs.map((t) => ({ value: t.id, label: t.name })))
            } catch {
                // ignore
            }
        }
        fetchMeta()
    }, [])

    // Auto-generate slug from title
    const titleValue = watch('title')
    useEffect(() => {
        if (!initialValues.slug) {
            const slug = titleValue
                ?.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            setValue('slug', slug || '')
        }
    }, [titleValue, initialValues.slug, setValue])

    const handleFormSubmit = (values) => {
        const payload = {
            ...values,
            category_id: values.category_id?.value || values.category_id || null,
            // Backend expects tags as array of strings (names)
            tags: values.tags?.map((t) => {
                if (typeof t === 'string') return t
                return t.label ?? t.name ?? String(t.value ?? '')
            }).filter(Boolean) || [],
        }
        onSubmit(payload)
    }

    return (
        <Form onSubmit={handleSubmit(handleFormSubmit)}>
            <Tabs defaultValue="content">
                <TabList>
                    <TabNav value="content">Content</TabNav>
                    <TabNav value="settings">Settings</TabNav>
                    <TabNav value="seo">SEO</TabNav>
                    <TabNav value="og">Open Graph</TabNav>
                </TabList>

                {/* ─── Content Tab ─── */}
                <TabContent value="content">
                    <AdaptiveCard className="mt-4">
                        <div className="flex flex-col gap-4">
                            <FormItem
                                label="Title"
                                invalid={!!errors.title}
                                errorMessage={errors.title?.message}
                            >
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="Enter blog title" {...field} />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Slug">
                                <Controller
                                    name="slug"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="auto-generated-slug" {...field} />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Excerpt">
                                <Controller
                                    name="excerpt"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            textArea
                                            rows={3}
                                            placeholder="Short description of the post"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Content">
                                <Controller
                                    name="content"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                            <RichTextEditor
                                                content={typeof field.value === 'object' ? (field.value?.html ?? '') : (field.value ?? '')}
                                                onChange={(val) => field.onChange(typeof val === 'object' ? (val?.html ?? '') : (val ?? ''))}
                                            />
                                        </div>
                                    )}
                                />
                            </FormItem>
                        </div>
                    </AdaptiveCard>
                </TabContent>

                {/* ─── Settings Tab ─── */}
                <TabContent value="settings">
                    <AdaptiveCard className="mt-4">
                        <div className="flex flex-col gap-4">
                            <FormItem label="Status">
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={statusOptions}
                                            value={statusOptions.find((o) => o.value === field.value)}
                                            onChange={(opt) => field.onChange(opt?.value)}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Category">
                                <Controller
                                    name="category_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            isClearable
                                            options={categories}
                                            value={categories.find((c) => c.value === (field.value?.value ?? field.value)) || null}
                                            onChange={field.onChange}
                                            placeholder="Select category"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Tags">
                                <Controller
                                    name="tags"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            isMulti
                                            options={tags}
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Select tags"
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Featured Image URL">
                                <Controller
                                    name="featured_image"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="https://..." {...field} />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Publish Date (for scheduled)">
                                <Controller
                                    name="published_at"
                                    control={control}
                                    render={({ field }) => (
                                        <Input type="datetime-local" {...field} />
                                    )}
                                />
                            </FormItem>

                            <div className="flex flex-col gap-3">
                                <FormItem label="Featured Post">
                                    <Controller
                                        name="is_featured"
                                        control={control}
                                        render={({ field }) => (
                                            <Switcher checked={field.value} onChange={field.onChange} />
                                        )}
                                    />
                                </FormItem>
                                <FormItem label="Enable Comments">
                                    <Controller
                                        name="is_comments_enabled"
                                        control={control}
                                        render={({ field }) => (
                                            <Switcher checked={field.value} onChange={field.onChange} />
                                        )}
                                    />
                                </FormItem>
                            </div>
                        </div>
                    </AdaptiveCard>
                </TabContent>

                {/* ─── SEO Tab ─── */}
                <TabContent value="seo">
                    <AdaptiveCard className="mt-4">
                        <div className="flex flex-col gap-4">
                            <FormItem label="Meta Title">
                                <Controller
                                    name="meta_title"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="SEO title (defaults to post title)" {...field} />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Meta Description">
                                <Controller
                                    name="meta_description"
                                    control={control}
                                    render={({ field }) => (
                                        <Input textArea rows={3} placeholder="Short SEO description" {...field} />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Meta Keywords">
                                <Controller
                                    name="meta_keywords"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="keyword1, keyword2, ..." {...field} />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </AdaptiveCard>
                </TabContent>

                {/* ─── Open Graph Tab ─── */}
                <TabContent value="og">
                    <AdaptiveCard className="mt-4">
                        <div className="flex flex-col gap-4">
                            <FormItem label="OG Title">
                                <Controller
                                    name="og_title"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="Open Graph title" {...field} />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="OG Description">
                                <Controller
                                    name="og_description"
                                    control={control}
                                    render={({ field }) => (
                                        <Input textArea rows={3} placeholder="Open Graph description" {...field} />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="OG Image URL">
                                <Controller
                                    name="og_image"
                                    control={control}
                                    render={({ field }) => (
                                        <Input placeholder="https://..." {...field} />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </AdaptiveCard>
                </TabContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6">
                <Button type="submit" variant="solid" loading={submitting}>
                    {submitting ? 'Saving...' : 'Save Post'}
                </Button>
            </div>
        </Form>
    )
}

export default BlogForm

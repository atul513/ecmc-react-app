import { useEffect, useState, useMemo } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiGetTags, apiCreateTag, apiDeleteTag } from '@/services/QBankService'
import { TbPlus, TbTrash, TbSearch } from 'react-icons/tb'

const CATEGORY_OPTIONS = [
    { value: 'exam', label: 'Exam' },
    { value: 'topic', label: 'Topic' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'general', label: 'General' },
]

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    category: z.string().min(1, 'Category is required'),
})

const TagList = () => {
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState({ open: false, tag: null })
    const [saving, setSaving] = useState(false)

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: '', slug: '', category: 'exam' },
    })

    const nameValue = watch('name')
    useEffect(() => {
        if (nameValue) {
            setValue('slug', nameValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
        }
    }, [nameValue, setValue])

    const load = async () => {
        setLoading(true)
        try {
            const params = {}
            if (categoryFilter) params.category = categoryFilter
            if (search) params.search = search
            const res = await apiGetTags(params)
            setTags(res?.data || [])
        } catch {
            toast.push(<Notification type="danger" title="Failed to load tags" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [categoryFilter])

    const onSubmit = async (values) => {
        setSaving(true)
        try {
            await apiCreateTag(values)
            toast.push(<Notification type="success" title="Tag created" />, { placement: 'top-center' })
            setDialogOpen(false)
            reset({ name: '', slug: '', category: 'exam' })
            load()
        } catch {
            toast.push(<Notification type="danger" title="Save failed" />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        try {
            await apiDeleteTag(deleteDialog.tag.id)
            toast.push(<Notification type="success" title="Tag deleted" />, { placement: 'top-center' })
            setDeleteDialog({ open: false, tag: null })
            load()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        }
    }

    const filtered = useMemo(
        () => tags.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase())),
        [tags, search]
    )

    const categoryColors = {
        exam: 'bg-blue-100 text-blue-700',
        topic: 'bg-purple-100 text-purple-700',
        difficulty: 'bg-amber-100 text-amber-700',
        general: 'bg-gray-100 text-gray-600',
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <h3 className="text-lg font-semibold">Tags</h3>
                        <div className="flex gap-2 items-center flex-wrap">
                            <Select
                                placeholder="All Categories"
                                options={CATEGORY_OPTIONS}
                                isClearable
                                className="w-44"
                                onChange={(opt) => setCategoryFilter(opt?.value || null)}
                            />
                            <Input
                                placeholder="Search tags..."
                                prefix={<TbSearch className="text-lg" />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-48"
                            />
                            <Button variant="solid" icon={<TbPlus />} onClick={() => { reset({ name: '', slug: '', category: 'exam' }); setDialogOpen(true) }}>
                                Add Tag
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner size="40px" /></div>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {filtered.length === 0 ? (
                                <p className="text-gray-400 py-8 w-full text-center">No tags found</p>
                            ) : filtered.map((tag) => (
                                <div key={tag.id} className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 bg-white dark:bg-gray-800 shadow-sm">
                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${categoryColors[tag.category] || 'bg-gray-100 text-gray-600'}`}>
                                        {tag.category}
                                    </span>
                                    <span className="text-sm font-medium">{tag.name}</span>
                                    <span className="text-xs text-gray-400 font-mono">{tag.slug}</span>
                                    {tag.usage_count !== undefined && (
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full px-1.5">{tag.usage_count}</span>
                                    )}
                                    <button
                                        className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                                        onClick={() => setDeleteDialog({ open: true, tag })}
                                    >
                                        <TbTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AdaptiveCard>

            {/* Create Dialog */}
            <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} onRequestClose={() => setDialogOpen(false)}>
                <h5 className="mb-4 font-semibold">New Tag</h5>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem label="Name" invalid={!!errors.name} errorMessage={errors.name?.message}>
                        <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="e.g. NEET 2025" />} />
                    </FormItem>
                    <FormItem label="Slug" invalid={!!errors.slug} errorMessage={errors.slug?.message}>
                        <Controller name="slug" control={control} render={({ field }) => <Input {...field} placeholder="e.g. neet-2025" />} />
                    </FormItem>
                    <FormItem label="Category" invalid={!!errors.category} errorMessage={errors.category?.message}>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={CATEGORY_OPTIONS}
                                    value={CATEGORY_OPTIONS.find((o) => o.value === field.value)}
                                    onChange={(opt) => field.onChange(opt?.value)}
                                />
                            )}
                        />
                    </FormItem>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="solid" loading={saving}>Create Tag</Button>
                    </div>
                </Form>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, tag: null })}>
                <h5 className="mb-2 font-semibold">Delete Tag</h5>
                <p className="text-sm text-gray-500 mb-6">
                    Delete tag <strong>{deleteDialog.tag?.name}</strong>? This may affect questions using this tag.
                </p>
                <div className="flex justify-end gap-2">
                    <Button onClick={() => setDeleteDialog({ open: false, tag: null })}>Cancel</Button>
                    <Button variant="solid" className="bg-red-500 hover:bg-red-600" onClick={confirmDelete}>Delete</Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default TagList

import { useEffect, useState, useMemo } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import Switcher from '@/components/ui/Switcher'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Table from '@/components/ui/Table'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiGetQuizCategories, apiCreateQuizCategory, apiUpdateQuizCategory, apiDeleteQuizCategory } from '@/services/QuizService'
import { TbPlus, TbPencil, TbTrash, TbSearch, TbChevronRight } from 'react-icons/tb'

const { THead, TBody, Tr, Th, Td } = Table

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().optional(),
    parent_id: z.any().nullable().optional(),
    sort_order: z.coerce.number().default(0),
    is_active: z.boolean().default(true),
})

const QuizCategoryList = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null })
    const [editing, setEditing] = useState(null)
    const [saving, setSaving] = useState(false)

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: '', slug: '', description: '', parent_id: null, sort_order: 0, is_active: true },
    })

    const nameVal = watch('name')
    useEffect(() => {
        if (!editing && nameVal) {
            setValue('slug', nameVal.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
        }
    }, [nameVal, editing, setValue])

    const load = async () => {
        setLoading(true)
        try {
            const res = await apiGetQuizCategories()
            setCategories(res?.data || [])
        } catch {
            toast.push(<Notification type="danger" title="Failed to load categories" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const parentOptions = useMemo(
        () => categories.filter((c) => !c.parent_id).map((c) => ({ value: c.id, label: c.name })),
        [categories]
    )

    const openCreate = () => {
        setEditing(null)
        reset({ name: '', slug: '', description: '', parent_id: null, sort_order: 0, is_active: true })
        setDialogOpen(true)
    }

    const openEdit = (item) => {
        setEditing(item)
        reset({
            name: item.name,
            slug: item.slug || '',
            description: item.description || '',
            parent_id: item.parent_id || null,
            sort_order: item.sort_order ?? 0,
            is_active: item.is_active ?? true,
        })
        setDialogOpen(true)
    }

    const onSubmit = async (values) => {
        setSaving(true)
        try {
            const payload = { ...values, parent_id: values.parent_id || null }
            if (editing) {
                await apiUpdateQuizCategory(editing.id, payload)
                toast.push(<Notification type="success" title="Category updated" />, { placement: 'top-center' })
            } else {
                await apiCreateQuizCategory(payload)
                toast.push(<Notification type="success" title="Category created" />, { placement: 'top-center' })
            }
            setDialogOpen(false)
            load()
        } catch {
            toast.push(<Notification type="danger" title="Save failed" />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        try {
            await apiDeleteQuizCategory(deleteDialog.item.id)
            toast.push(<Notification type="success" title="Category deleted" />, { placement: 'top-center' })
            setDeleteDialog({ open: false, item: null })
            load()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        }
    }

    const filtered = useMemo(
        () => categories.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase())),
        [categories, search]
    )

    const getParentName = (parentId) => categories.find((c) => c.id === parentId)?.name

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <h3 className="text-lg font-semibold">Quiz Categories</h3>
                        <div className="flex gap-2 items-center">
                            <Input prefix={<TbSearch />} placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-52" />
                            <Button variant="solid" icon={<TbPlus />} onClick={openCreate}>Add Category</Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner size="40px" /></div>
                    ) : (
                        <Table>
                            <THead><Tr><Th>Name</Th><Th>Slug</Th><Th>Parent</Th><Th>Quizzes</Th><Th>Order</Th><Th>Status</Th><Th>Actions</Th></Tr></THead>
                            <TBody>
                                {filtered.length === 0 ? (
                                    <Tr><Td colSpan={7} className="text-center text-gray-400 py-8">No categories found</Td></Tr>
                                ) : filtered.map((c) => (
                                    <Tr key={c.id}>
                                        <Td>
                                            <div className="flex items-center gap-1">
                                                {c.parent_id && <TbChevronRight className="text-gray-400 text-sm" />}
                                                <span className={c.parent_id ? 'text-gray-600 dark:text-gray-300' : 'font-medium'}>{c.name}</span>
                                            </div>
                                        </Td>
                                        <Td><code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{c.slug}</code></Td>
                                        <Td>{c.parent_id ? getParentName(c.parent_id) : <span className="text-gray-400 text-sm">Root</span>}</Td>
                                        <Td>{c.quizzes_count ?? '—'}</Td>
                                        <Td>{c.sort_order}</Td>
                                        <Td>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {c.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </Td>
                                        <Td>
                                            <div className="flex gap-2">
                                                <Button size="xs" icon={<TbPencil />} onClick={() => openEdit(c)} />
                                                <Button size="xs" variant="plain" className="text-red-500" icon={<TbTrash />} onClick={() => setDeleteDialog({ open: true, item: c })} />
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    )}
                </div>
            </AdaptiveCard>

            <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} onRequestClose={() => setDialogOpen(false)}>
                <h5 className="mb-4 font-semibold">{editing ? 'Edit Category' : 'New Category'}</h5>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="Name *" invalid={!!errors.name} errorMessage={errors.name?.message}>
                            <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="e.g. NEET Mock Tests" />} />
                        </FormItem>
                        <FormItem label="Slug *" invalid={!!errors.slug} errorMessage={errors.slug?.message}>
                            <Controller name="slug" control={control} render={({ field }) => <Input {...field} placeholder="e.g. neet-mock-tests" />} />
                        </FormItem>
                    </div>
                    <FormItem label="Description">
                        <Controller name="description" control={control} render={({ field }) => <Input textArea rows={2} {...field} />} />
                    </FormItem>
                    <FormItem label="Parent Category">
                        <Controller name="parent_id" control={control} render={({ field }) => (
                            <Select isClearable placeholder="None (root)" options={parentOptions}
                                value={parentOptions.find((o) => o.value === field.value) || null}
                                onChange={(opt) => field.onChange(opt?.value || null)} />
                        )} />
                    </FormItem>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="Sort Order">
                            <Controller name="sort_order" control={control} render={({ field }) => <Input type="number" {...field} />} />
                        </FormItem>
                        <FormItem label="Active">
                            <Controller name="is_active" control={control} render={({ field }) => <Switcher checked={field.value} onChange={field.onChange} />} />
                        </FormItem>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="solid" loading={saving}>Save</Button>
                    </div>
                </Form>
            </Dialog>

            <Dialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })}>
                <h5 className="mb-2 font-semibold">Delete Category</h5>
                <p className="text-sm text-gray-500 mb-6">Delete <strong>{deleteDialog.item?.name}</strong>? This cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button onClick={() => setDeleteDialog({ open: false, item: null })}>Cancel</Button>
                    <Button variant="solid" className="bg-red-500 hover:bg-red-600" onClick={confirmDelete}>Delete</Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default QuizCategoryList

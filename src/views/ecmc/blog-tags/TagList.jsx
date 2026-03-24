import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import DebouceInput from '@/components/shared/DebouceInput'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Tooltip from '@/components/ui/Tooltip'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiGetBlogTags,
    apiCreateBlogTag,
    apiUpdateBlogTag,
    apiDeleteBlogTag,
} from '@/services/BlogService'
import { TbPlus, TbPencil, TbTrash, TbSearch } from 'react-icons/tb'

const schema = z.object({
    name: z.string().min(1, 'Tag name is required'),
    slug: z.string().optional(),
})

const TagList = () => {
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [query, setQuery] = useState('')

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: { name: '', slug: '' },
        resolver: zodResolver(schema),
    })

    const nameValue = watch('name')
    useEffect(() => {
        if (!editingId) {
            const slug = nameValue?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
            setValue('slug', slug || '')
        }
    }, [nameValue, editingId, setValue])

    const fetchTags = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiGetBlogTags({ page: pageIndex, per_page: pageSize, search: query || undefined })
            setData(res?.data?.data || res?.data || [])
            setTotal(res?.data?.total || res?.total || 0)
        } catch {
            toast.push(<Notification type="danger" title="Failed to load tags" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, query])

    useEffect(() => { fetchTags() }, [fetchTags])

    const openCreate = () => {
        setEditingId(null)
        reset({ name: '', slug: '' })
        setDialogOpen(true)
    }

    const openEdit = (row) => {
        setEditingId(row.id)
        reset({ name: row.name || '', slug: row.slug || '' })
        setDialogOpen(true)
    }

    const handleFormSubmit = async (values) => {
        setSubmitting(true)
        try {
            if (editingId) {
                await apiUpdateBlogTag(editingId, values)
                toast.push(<Notification type="success" title="Tag updated" />, { placement: 'top-center' })
            } else {
                await apiCreateBlogTag(values)
                toast.push(<Notification type="success" title="Tag created" />, { placement: 'top-center' })
            }
            setDialogOpen(false)
            fetchTags()
        } catch (err) {
            const msg = err?.response?.data?.message || 'Operation failed'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await apiDeleteBlogTag(deleteId)
            toast.push(<Notification type="success" title="Tag deleted" />, { placement: 'top-center' })
            setDeleteId(null)
            fetchTags()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        }
    }

    const columns = useMemo(() => [
        {
            header: 'Name',
            accessorKey: 'name',
            cell: (props) => <span className="font-medium">{props.row.original.name}</span>,
        },
        {
            header: 'Slug',
            accessorKey: 'slug',
            cell: (props) => (
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {props.row.original.slug}
                </code>
            ),
        },
        {
            header: 'Posts',
            accessorKey: 'blogs_count',
            cell: (props) => <span>{props.row.original.blogs_count ?? 0}</span>,
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip title="Edit">
                            <Button size="xs" icon={<TbPencil />} onClick={() => openEdit(row)} />
                        </Tooltip>
                        <Tooltip title="Delete">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbTrash className="text-red-500" />}
                                onClick={() => setDeleteId(row.id)}
                            />
                        </Tooltip>
                    </div>
                )
            },
        },
    ], [])

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3 className="text-lg font-semibold">Blog Tags</h3>
                        <Button variant="solid" icon={<TbPlus />} onClick={openCreate}>
                            New Tag
                        </Button>
                    </div>
                    <DebouceInput
                        placeholder="Search tags..."
                        prefix={<TbSearch className="text-lg" />}
                        onChange={(e) => { setQuery(e.target.value); setPageIndex(1) }}
                    />
                    <DataTable
                        columns={columns}
                        data={data}
                        loading={loading}
                        pagingData={{ total, pageIndex, pageSize }}
                        onPaginationChange={setPageIndex}
                        onSelectChange={(size) => { setPageSize(size); setPageIndex(1) }}
                    />
                </div>
            </AdaptiveCard>

            {/* Create / Edit Dialog */}
            <Dialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onRequestClose={() => setDialogOpen(false)}
            >
                <h4 className="mb-4 font-semibold">{editingId ? 'Edit Tag' : 'New Tag'}</h4>
                <Form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="flex flex-col gap-4">
                        <FormItem label="Name" invalid={!!errors.name} errorMessage={errors.name?.message}>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => <Input placeholder="Tag name" {...field} />}
                            />
                        </FormItem>
                        <FormItem label="Slug">
                            <Controller
                                name="slug"
                                control={control}
                                render={({ field }) => <Input placeholder="auto-slug" {...field} />}
                            />
                        </FormItem>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="solid" loading={submitting}>
                            {editingId ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </Form>
            </Dialog>

            <ConfirmDialog
                isOpen={!!deleteId}
                type="danger"
                title="Delete Tag"
                onClose={() => setDeleteId(null)}
                onRequestClose={() => setDeleteId(null)}
                onCancel={() => setDeleteId(null)}
                onConfirm={handleDelete}
            >
                <p>Are you sure you want to delete this tag?</p>
            </ConfirmDialog>
        </Container>
    )
}

export default TagList

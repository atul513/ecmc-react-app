import { useEffect, useState, useMemo } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Dialog from '@/components/ui/Dialog'
import { Form, FormItem } from '@/components/ui/Form'
import Switcher from '@/components/ui/Switcher'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    apiGetSubjects,
    apiCreateSubject,
    apiUpdateSubject,
    apiDeleteSubject,
} from '@/services/QBankService'
import { TbPlus, TbPencil, TbTrash, TbSearch } from 'react-icons/tb'
import Table from '@/components/ui/Table'

const { THead, TBody, Tr, Th, Td } = Table

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    description: z.string().optional(),
    sort_order: z.coerce.number().default(0),
    is_active: z.boolean().default(true),
})

const SubjectList = () => {
    const [subjects, setSubjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState({ open: false, subject: null })
    const [editing, setEditing] = useState(null)
    const [saving, setSaving] = useState(false)

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: '', code: '', description: '', sort_order: 0, is_active: true },
    })

    const load = async () => {
        setLoading(true)
        try {
            const res = await apiGetSubjects({ active_only: false })
            setSubjects(res?.data || [])
        } catch {
            toast.push(<Notification type="danger" title="Failed to load subjects" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const openCreate = () => {
        setEditing(null)
        reset({ name: '', code: '', description: '', sort_order: 0, is_active: true })
        setDialogOpen(true)
    }

    const openEdit = (subject) => {
        setEditing(subject)
        reset({
            name: subject.name,
            code: subject.code || '',
            description: subject.description || '',
            sort_order: subject.sort_order ?? 0,
            is_active: subject.is_active ?? true,
        })
        setDialogOpen(true)
    }

    const onSubmit = async (values) => {
        setSaving(true)
        try {
            if (editing) {
                await apiUpdateSubject(editing.id, values)
                toast.push(<Notification type="success" title="Subject updated" />, { placement: 'top-center' })
            } else {
                await apiCreateSubject(values)
                toast.push(<Notification type="success" title="Subject created" />, { placement: 'top-center' })
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
            await apiDeleteSubject(deleteDialog.subject.id)
            toast.push(<Notification type="success" title="Subject deleted" />, { placement: 'top-center' })
            setDeleteDialog({ open: false, subject: null })
            load()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        }
    }

    const filtered = useMemo(
        () => subjects.filter((s) => s.name?.toLowerCase().includes(search.toLowerCase())),
        [subjects, search]
    )

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <h3 className="text-lg font-semibold">Subjects</h3>
                        <div className="flex gap-2 items-center">
                            <Input
                                placeholder="Search subjects..."
                                prefix={<TbSearch className="text-lg" />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-56"
                            />
                            <Button variant="solid" icon={<TbPlus />} onClick={openCreate}>
                                Add Subject
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner size="40px" /></div>
                    ) : (
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th>Code</Th>
                                    <Th>Questions</Th>
                                    <Th>Order</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {filtered.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={6} className="text-center text-gray-400 py-8">No subjects found</Td>
                                    </Tr>
                                ) : filtered.map((s) => (
                                    <Tr key={s.id}>
                                        <Td>
                                            <div className="font-medium">{s.name}</div>
                                            {s.description && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{s.description}</div>}
                                        </Td>
                                        <Td><span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{s.code}</span></Td>
                                        <Td>{s.questions_count ?? '—'}</Td>
                                        <Td>{s.sort_order}</Td>
                                        <Td>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {s.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </Td>
                                        <Td>
                                            <div className="flex gap-2">
                                                <Button size="xs" icon={<TbPencil />} onClick={() => openEdit(s)} />
                                                <Button size="xs" variant="plain" className="text-red-500" icon={<TbTrash />} onClick={() => setDeleteDialog({ open: true, subject: s })} />
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    )}
                </div>
            </AdaptiveCard>

            {/* Create / Edit Dialog */}
            <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} onRequestClose={() => setDialogOpen(false)}>
                <h5 className="mb-4 font-semibold">{editing ? 'Edit Subject' : 'New Subject'}</h5>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem label="Name" invalid={!!errors.name} errorMessage={errors.name?.message}>
                            <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="e.g. Physics" />} />
                        </FormItem>
                        <FormItem label="Code" invalid={!!errors.code} errorMessage={errors.code?.message}>
                            <Controller name="code" control={control} render={({ field }) => <Input {...field} placeholder="e.g. PHY" />} />
                        </FormItem>
                    </div>
                    <FormItem label="Description">
                        <Controller name="description" control={control} render={({ field }) => <Input textArea rows={2} {...field} placeholder="Optional description" />} />
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

            {/* Delete Confirm */}
            <Dialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, subject: null })}>
                <h5 className="mb-2 font-semibold">Delete Subject</h5>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete <strong>{deleteDialog.subject?.name}</strong>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <Button onClick={() => setDeleteDialog({ open: false, subject: null })}>Cancel</Button>
                    <Button variant="solid" className="bg-red-500 hover:bg-red-600" onClick={confirmDelete}>Delete</Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default SubjectList

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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    apiGetSubjects,
    apiGetTopics,
    apiCreateTopic,
    apiUpdateTopic,
    apiDeleteTopic,
} from '@/services/QBankService'
import { TbPlus, TbPencil, TbTrash, TbSearch, TbChevronRight } from 'react-icons/tb'
import Table from '@/components/ui/Table'

const { THead, TBody, Tr, Th, Td } = Table

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().optional(),
    parent_topic_id: z.any().nullable().optional(),
    sort_order: z.coerce.number().default(0),
    is_active: z.boolean().default(true),
})

const TopicList = () => {
    const [subjects, setSubjects] = useState([])
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState({ open: false, topic: null })
    const [editing, setEditing] = useState(null)
    const [saving, setSaving] = useState(false)

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: '', code: '', parent_topic_id: null, sort_order: 0, is_active: true },
    })

    useEffect(() => {
        apiGetSubjects({ active_only: true }).then((res) => {
            setSubjects((res?.data || []).map((s) => ({ value: s.id, label: s.name })))
        }).catch(() => {})
    }, [])

    const loadTopics = async (subjectId) => {
        if (!subjectId) { setTopics([]); return }
        setLoading(true)
        try {
            const res = await apiGetTopics(subjectId, { active_only: false })
            setTopics(res?.data || [])
        } catch {
            toast.push(<Notification type="danger" title="Failed to load topics" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }

    const topicOptions = useMemo(
        () => topics.filter((t) => !t.parent_topic_id).map((t) => ({ value: t.id, label: t.name })),
        [topics]
    )

    const openCreate = () => {
        setEditing(null)
        reset({ name: '', code: '', parent_topic_id: null, sort_order: 0, is_active: true })
        setDialogOpen(true)
    }

    const openEdit = (topic) => {
        setEditing(topic)
        reset({
            name: topic.name,
            code: topic.code || '',
            parent_topic_id: topic.parent_topic_id || null,
            sort_order: topic.sort_order ?? 0,
            is_active: topic.is_active ?? true,
        })
        setDialogOpen(true)
    }

    const onSubmit = async (values) => {
        if (!selectedSubject) {
            toast.push(<Notification type="warning" title="Please select a subject first" />, { placement: 'top-center' })
            return
        }
        setSaving(true)
        try {
            const payload = { ...values, subject_id: selectedSubject, parent_topic_id: values.parent_topic_id || null }
            if (editing) {
                await apiUpdateTopic(editing.id, payload)
                toast.push(<Notification type="success" title="Topic updated" />, { placement: 'top-center' })
            } else {
                await apiCreateTopic(payload)
                toast.push(<Notification type="success" title="Topic created" />, { placement: 'top-center' })
            }
            setDialogOpen(false)
            loadTopics(selectedSubject)
        } catch {
            toast.push(<Notification type="danger" title="Save failed" />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        try {
            await apiDeleteTopic(deleteDialog.topic.id)
            toast.push(<Notification type="success" title="Topic deleted" />, { placement: 'top-center' })
            setDeleteDialog({ open: false, topic: null })
            loadTopics(selectedSubject)
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        }
    }

    const filtered = useMemo(
        () => topics.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase())),
        [topics, search]
    )

    const getParentName = (parentId) => topics.find((t) => t.id === parentId)?.name || null

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <h3 className="text-lg font-semibold">Topics</h3>
                        <div className="flex gap-2 items-center flex-wrap">
                            <Select
                                placeholder="Select Subject"
                                options={subjects}
                                className="w-48"
                                onChange={(opt) => {
                                    setSelectedSubject(opt?.value || null)
                                    loadTopics(opt?.value || null)
                                }}
                            />
                            <Input
                                placeholder="Search topics..."
                                prefix={<TbSearch className="text-lg" />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-48"
                            />
                            <Button variant="solid" icon={<TbPlus />} onClick={openCreate} disabled={!selectedSubject}>
                                Add Topic
                            </Button>
                        </div>
                    </div>

                    {!selectedSubject ? (
                        <div className="text-center py-12 text-gray-400">Select a subject to view its topics</div>
                    ) : loading ? (
                        <div className="flex justify-center py-12"><Spinner size="40px" /></div>
                    ) : (
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>Topic</Th>
                                    <Th>Code</Th>
                                    <Th>Parent</Th>
                                    <Th>Questions</Th>
                                    <Th>Order</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {filtered.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={7} className="text-center text-gray-400 py-8">No topics found</Td>
                                    </Tr>
                                ) : filtered.map((t) => {
                                    const parentName = t.parent_topic_id ? getParentName(t.parent_topic_id) : null
                                    return (
                                        <Tr key={t.id}>
                                            <Td>
                                                <div className="flex items-center gap-1">
                                                    {parentName && <TbChevronRight className="text-gray-400 text-sm" />}
                                                    <span className={parentName ? 'pl-1 text-gray-600 dark:text-gray-300' : 'font-medium'}>{t.name}</span>
                                                </div>
                                            </Td>
                                            <Td><span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{t.code || '—'}</span></Td>
                                            <Td>{parentName || <span className="text-gray-400 text-sm">Root</span>}</Td>
                                            <Td>{t.questions_count ?? '—'}</Td>
                                            <Td>{t.sort_order}</Td>
                                            <Td>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {t.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </Td>
                                            <Td>
                                                <div className="flex gap-2">
                                                    <Button size="xs" icon={<TbPencil />} onClick={() => openEdit(t)} />
                                                    <Button size="xs" variant="plain" className="text-red-500" icon={<TbTrash />} onClick={() => setDeleteDialog({ open: true, topic: t })} />
                                                </div>
                                            </Td>
                                        </Tr>
                                    )
                                })}
                            </TBody>
                        </Table>
                    )}
                </div>
            </AdaptiveCard>

            {/* Create / Edit Dialog */}
            <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} onRequestClose={() => setDialogOpen(false)}>
                <h5 className="mb-4 font-semibold">{editing ? 'Edit Topic' : 'New Topic'}</h5>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem label="Name" invalid={!!errors.name} errorMessage={errors.name?.message}>
                            <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="e.g. Newton's Laws" />} />
                        </FormItem>
                        <FormItem label="Code">
                            <Controller name="code" control={control} render={({ field }) => <Input {...field} placeholder="e.g. NEWTON_LAWS" />} />
                        </FormItem>
                    </div>
                    <FormItem label="Parent Topic (leave empty for root)">
                        <Controller
                            name="parent_topic_id"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    isClearable
                                    placeholder="None (root topic)"
                                    options={topicOptions}
                                    value={topicOptions.find((o) => o.value === field.value) || null}
                                    onChange={(opt) => field.onChange(opt?.value || null)}
                                />
                            )}
                        />
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
            <Dialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, topic: null })}>
                <h5 className="mb-2 font-semibold">Delete Topic</h5>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete <strong>{deleteDialog.topic?.name}</strong>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <Button onClick={() => setDeleteDialog({ open: false, topic: null })}>Cancel</Button>
                    <Button variant="solid" className="bg-red-500 hover:bg-red-600" onClick={confirmDelete}>Delete</Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default TopicList

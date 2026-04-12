import { useEffect, useState, useCallback } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Dialog from '@/components/ui/Dialog'
import {
    TbPlus, TbEdit, TbTrash, TbSearch, TbLoader,
    TbAlertCircle, TbSitemap, TbChevronRight, TbCheck, TbX,
    TbRefresh,
} from 'react-icons/tb'
import {
    apiGetExamSections, apiGetExamSectionTypes,
    apiCreateExamSection, apiUpdateExamSection, apiDeleteExamSection,
} from '@/services/ExamSectionService'

const FALLBACK_TYPES = ['exam_group', 'exam', 'variant', 'subject', 'chapter', 'topic']

const TYPE_COLORS = {
    exam_group: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    exam: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    variant: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    subject: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    chapter: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    topic: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

const TypeBadge = ({ type }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}>
        {(type || '').replace('_', ' ')}
    </span>
)

const EMPTY_FORM = {
    name: '', type: '', parent_id: '', code: '', description: '',
    short_name: '', sort_order: '', is_active: true, is_featured: false,
}

const ExamSectionList = () => {
    const [items, setItems] = useState([])
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('')
    const [filterActive, setFilterActive] = useState('')

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    const [deleteId, setDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const fetchItems = useCallback(() => {
        setLoading(true)
        const params = {}
        if (filterType) params.type = filterType
        if (filterActive !== '') params.is_active = filterActive
        if (search) params.search = search
        apiGetExamSections(params)
            .then((res) => setItems(res?.data?.data || res?.data || []))
            .catch(() => toast.push(<Notification type="danger" title="Failed to load exam sections" />, { placement: 'top-center' }))
            .finally(() => setLoading(false))
    }, [filterType, filterActive, search])

    useEffect(() => {
        apiGetExamSectionTypes()
            .then((res) => {
                const t = res?.data || []
                setTypes(Array.isArray(t) ? t : FALLBACK_TYPES)
            })
            .catch(() => setTypes(FALLBACK_TYPES))
    }, [])

    useEffect(() => { fetchItems() }, [fetchItems])

    const openCreate = () => {
        setEditItem(null)
        setForm(EMPTY_FORM)
        setDialogOpen(true)
    }

    const openEdit = (item) => {
        setEditItem(item)
        setForm({
            name: item.name || '',
            type: item.type || '',
            parent_id: item.parent_id ? String(item.parent_id) : '',
            code: item.code || '',
            description: item.description || '',
            short_name: item.short_name || '',
            sort_order: item.sort_order != null ? String(item.sort_order) : '',
            is_active: item.is_active ?? true,
            is_featured: item.is_featured ?? false,
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.type) {
            toast.push(<Notification type="warning" title="Name and Type are required" />, { placement: 'top-center' })
            return
        }
        setSaving(true)
        const payload = {
            name: form.name.trim(),
            type: form.type,
            is_active: form.is_active,
            is_featured: form.is_featured,
        }
        if (form.parent_id) payload.parent_id = Number(form.parent_id)
        if (form.code.trim()) payload.code = form.code.trim()
        if (form.description.trim()) payload.description = form.description.trim()
        if (form.short_name.trim()) payload.short_name = form.short_name.trim()
        if (form.sort_order !== '') payload.sort_order = Number(form.sort_order)

        try {
            if (editItem) {
                await apiUpdateExamSection(editItem.id, payload)
                toast.push(<Notification type="success" title="Section updated" />, { placement: 'top-center' })
            } else {
                await apiCreateExamSection(payload)
                toast.push(<Notification type="success" title="Section created" />, { placement: 'top-center' })
            }
            setDialogOpen(false)
            fetchItems()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Save failed'} />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setDeleting(true)
        try {
            await apiDeleteExamSection(deleteId)
            toast.push(<Notification type="success" title="Section deleted" />, { placement: 'top-center' })
            setDeleteId(null)
            fetchItems()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Delete failed'} />, { placement: 'top-center' })
        } finally {
            setDeleting(false)
        }
    }

    const typeOptions = [{ value: '', label: 'All Types' }, ...(types.map((t) => ({ value: t, label: t.replace('_', ' ') })))]
    const activeOptions = [{ value: '', label: 'All Status' }, { value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]
    const parentOptions = [
        { value: '', label: '— No Parent —' },
        ...items.map((s) => ({ value: String(s.id), label: `[${(s.type || '').replace('_', ' ')}] ${s.name}` })),
    ]
    const formTypeOptions = types.map((t) => ({ value: t, label: t.replace('_', ' ') }))

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <TbSitemap className="text-primary" /> Exam Sections
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Hierarchical taxonomy: Exam Group → Exam → Variant → Subject → Chapter → Topic
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button icon={<TbRefresh />} onClick={fetchItems} disabled={loading} />
                    <Button variant="solid" icon={<TbPlus />} onClick={openCreate}>
                        Add Section
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        prefix={<TbSearch />}
                        placeholder="Search sections..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="min-w-[160px]">
                    <Select
                        options={typeOptions}
                        value={typeOptions.find((o) => o.value === filterType)}
                        onChange={(opt) => setFilterType(opt?.value || '')}
                        placeholder="Filter by Type"
                    />
                </div>
                <div className="min-w-[140px]">
                    <Select
                        options={activeOptions}
                        value={activeOptions.find((o) => o.value === filterActive)}
                        onChange={(opt) => setFilterActive(opt?.value ?? '')}
                        placeholder="Status"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <TbLoader className="animate-spin text-4xl text-primary" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                        <TbAlertCircle className="text-4xl" />
                        <p>No exam sections found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 uppercase">
                                    <th className="text-left px-4 py-3">Name</th>
                                    <th className="text-left px-4 py-3">Type</th>
                                    <th className="text-left px-4 py-3">Parent</th>
                                    <th className="text-left px-4 py-3">Code</th>
                                    <th className="text-left px-4 py-3">Order</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-800 dark:text-gray-100">{item.name}</div>
                                            {item.short_name && (
                                                <div className="text-xs text-gray-400">{item.short_name}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3"><TypeBadge type={item.type} /></td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {item.parent?.name ? (
                                                <span className="flex items-center gap-1">
                                                    <TbChevronRight size={12} />
                                                    {item.parent.name}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.code || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500 text-center">{item.sort_order ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${item.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                {item.is_active ? <TbCheck size={11} /> : <TbX size={11} />}
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="xs"
                                                    icon={<TbEdit />}
                                                    onClick={() => openEdit(item)}
                                                />
                                                <Button
                                                    size="xs"
                                                    variant="plain"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    icon={<TbTrash />}
                                                    onClick={() => setDeleteId(item.id)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onRequestClose={() => setDialogOpen(false)}
                width={560}
            >
                <h5 className="text-lg font-semibold mb-5">
                    {editItem ? 'Edit Section' : 'Add New Section'}
                </h5>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. JEE Advanced, Physics, Mechanics"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={formTypeOptions}
                                value={formTypeOptions.find((o) => o.value === form.type) || null}
                                onChange={(opt) => setForm((f) => ({ ...f, type: opt?.value || '' }))}
                                placeholder="Select type"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent</label>
                            <Select
                                options={parentOptions}
                                value={parentOptions.find((o) => o.value === form.parent_id) || parentOptions[0]}
                                onChange={(opt) => setForm((f) => ({ ...f, parent_id: opt?.value || '' }))}
                                placeholder="No parent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
                            <Input
                                value={form.code}
                                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                                placeholder="e.g. JEE-ADV"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Name</label>
                            <Input
                                value={form.short_name}
                                onChange={(e) => setForm((f) => ({ ...f, short_name: e.target.value }))}
                                placeholder="e.g. JEE"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort Order</label>
                            <Input
                                type="number"
                                value={form.sort_order}
                                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                                placeholder="0"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                rows={2}
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                                className={`w-10 h-5 rounded-full transition-colors relative ${form.is_active ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</label>
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))}
                                className={`w-10 h-5 rounded-full transition-colors relative ${form.is_featured ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                        <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
                        <Button variant="solid" onClick={handleSave} loading={saving}>
                            {editItem ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onRequestClose={() => setDeleteId(null)}
                width={400}
            >
                <div className="text-center py-4">
                    <TbAlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
                    <h5 className="text-lg font-semibold mb-2">Delete Section?</h5>
                    <p className="text-sm text-gray-500 mb-6">
                        This action cannot be undone. Sections with children cannot be deleted.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
                        <Button
                            variant="solid"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            loading={deleting}
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default ExamSectionList

import { useEffect, useState, useCallback, useRef } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Dialog from '@/components/ui/Dialog'
import {
    TbPlus, TbEdit, TbTrash, TbSearch, TbLoader,
    TbAlertCircle, TbSitemap, TbChevronRight, TbCheck, TbX,
    TbRefresh, TbChevronLeft, TbSelectAll, TbSquare, TbSquareCheck,
} from 'react-icons/tb'
import {
    apiGetExamSections, apiGetExamSectionTypes,
    apiCreateExamSection, apiUpdateExamSection, apiDeleteExamSection,
} from '@/services/ExamSectionService'

const FALLBACK_TYPES = ['exam_group', 'exam', 'variant', 'class', 'subject', 'chapter', 'topic']

const TYPE_COLORS = {
    exam_group: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    exam: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    variant: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    subject: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    chapter: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    topic: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

const TYPE_BADGE_INLINE = {
    exam_group: 'bg-purple-100 text-purple-700',
    exam: 'bg-blue-100 text-blue-700',
    variant: 'bg-cyan-100 text-cyan-700',
    class: 'bg-indigo-100 text-indigo-700',
    subject: 'bg-emerald-100 text-emerald-700',
    chapter: 'bg-amber-100 text-amber-700',
    topic: 'bg-rose-100 text-rose-700',
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

const PER_PAGE = 20

// ─── Parent Search Select ─────────────────────────────────────────────────────
const ParentSearchSelect = ({ value, onChange }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [selectedLabel, setSelectedLabel] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const timer = useRef(null)
    const wrapRef = useRef(null)

    useEffect(() => {
        if (!value) { setSelectedLabel(''); setSelectedType(''); setQuery('') }
    }, [value])

    const doSearch = useCallback((q) => {
        if (!q.trim()) { setResults([]); setLoading(false); return }
        setLoading(true)
        apiGetExamSections({ search: q.trim(), per_page: 30 })
            .then((res) => {
                const data = res?.data?.data || res?.data || []
                setResults(Array.isArray(data) ? data : [])
            })
            .catch(() => setResults([]))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => doSearch(query), 350)
        return () => clearTimeout(timer.current)
    }, [query, doSearch])

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const select = (section) => {
        onChange(section)
        setSelectedLabel(`${section.name}${section.code ? ` (${section.code})` : ''}`)
        setSelectedType(section.type || '')
        setQuery('')
        setResults([])
        setOpen(false)
    }

    const clear = () => { onChange(null); setSelectedLabel(''); setSelectedType(''); setQuery(''); setResults([]) }

    return (
        <div ref={wrapRef} className="relative">
            {value && selectedLabel ? (
                <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${TYPE_BADGE_INLINE[selectedType] || 'bg-gray-100 text-gray-600'}`}>
                        {selectedType.replace('_', ' ')}
                    </span>
                    <span className="text-sm flex-1 text-gray-800 dark:text-gray-100 truncate">{selectedLabel}</span>
                    <button type="button" onClick={clear} className="text-gray-400 hover:text-red-500 transition-colors">
                        <TbX size={14} />
                    </button>
                </div>
            ) : (
                <Input
                    prefix={<TbSearch size={14} />}
                    placeholder="Search parent by name or code…"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                    onFocus={() => { if (query) setOpen(true) }}
                    suffix={loading ? <TbLoader size={14} className="animate-spin text-gray-400" /> : null}
                />
            )}

            {open && !value && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                    {loading && results.length === 0 && (
                        <div className="flex justify-center py-4"><TbLoader className="animate-spin text-primary" /></div>
                    )}
                    {results.map((s) => (
                        <button key={s.id} type="button" onClick={() => select(s)}
                            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-50 dark:border-gray-700 last:border-0 flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${TYPE_BADGE_INLINE[s.type] || 'bg-gray-100 text-gray-600'}`}>
                                    {(s.type || '').replace('_', ' ')}
                                </span>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{s.name}</span>
                                {s.code && <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded ml-auto">{s.code}</span>}
                            </div>
                            {s.slug && <span className="text-[11px] text-gray-400 pl-1">{s.slug}</span>}
                        </button>
                    ))}
                    {!loading && query.trim() && results.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">No sections found</p>
                    )}
                    {!query && !loading && (
                        <p className="text-xs text-gray-400 text-center py-3">Type to search for a parent section</p>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ExamSectionList = () => {
    const [items, setItems] = useState([])
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('')
    const [filterActive, setFilterActive] = useState('')

    // Pagination
    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [total, setTotal] = useState(0)

    // Bulk selection
    const [selected, setSelected] = useState(new Set())
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const [bulkDeleting, setBulkDeleting] = useState(false)
    const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 })

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [selectedParent, setSelectedParent] = useState(null)
    const [saving, setSaving] = useState(false)

    const [deleteId, setDeleteId] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const searchTimer = useRef(null)
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
        return () => clearTimeout(searchTimer.current)
    }, [search])

    useEffect(() => { setPage(1); setSelected(new Set()) }, [filterType, filterActive])

    const fetchItems = useCallback(() => {
        setLoading(true)
        const params = { page, per_page: PER_PAGE }
        if (filterType) params.type = filterType
        if (filterActive !== '') params.is_active = filterActive
        if (debouncedSearch) params.search = debouncedSearch
        apiGetExamSections(params)
            .then((res) => {
                const d = res?.data
                if (d && d.data && Array.isArray(d.data)) {
                    setItems(d.data)
                    setLastPage(d.last_page ?? 1)
                    setTotal(d.total ?? d.data.length)
                } else {
                    const arr = Array.isArray(d) ? d : []
                    setItems(arr)
                    setLastPage(1)
                    setTotal(arr.length)
                }
            })
            .catch(() => toast.push(<Notification type="danger" title="Failed to load exam sections" />, { placement: 'top-center' }))
            .finally(() => setLoading(false))
    }, [filterType, filterActive, debouncedSearch, page])

    useEffect(() => {
        apiGetExamSectionTypes()
            .then((res) => {
                const t = res?.data || []
                setTypes(Array.isArray(t) ? t : FALLBACK_TYPES)
            })
            .catch(() => setTypes(FALLBACK_TYPES))
    }, [])

    useEffect(() => { fetchItems() }, [fetchItems])

    // Clear selection when page changes
    useEffect(() => { setSelected(new Set()) }, [page])

    // ── Selection helpers ──────────────────────────────────────────────────────
    const allPageIds = items.map((i) => i.id)
    const allSelected = allPageIds.length > 0 && allPageIds.every((id) => selected.has(id))
    const someSelected = selected.size > 0

    const toggleAll = () => {
        if (allSelected) {
            setSelected((prev) => {
                const next = new Set(prev)
                allPageIds.forEach((id) => next.delete(id))
                return next
            })
        } else {
            setSelected((prev) => new Set([...prev, ...allPageIds]))
        }
    }

    const toggleOne = (id) => {
        setSelected((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    // ── Bulk Delete ────────────────────────────────────────────────────────────
    const handleBulkDelete = async () => {
        const ids = [...selected]
        setBulkProgress({ done: 0, total: ids.length })
        setBulkDeleting(true)
        let failed = 0
        for (const id of ids) {
            try {
                await apiDeleteExamSection(id)
            } catch {
                failed++
            }
            setBulkProgress((p) => ({ ...p, done: p.done + 1 }))
        }
        setBulkDeleting(false)
        setBulkDeleteOpen(false)
        setSelected(new Set())
        if (failed > 0) {
            toast.push(<Notification type="warning" title={`${ids.length - failed} deleted, ${failed} failed (may have children)`} />, { placement: 'top-center' })
        } else {
            toast.push(<Notification type="success" title={`${ids.length} section${ids.length > 1 ? 's' : ''} deleted`} />, { placement: 'top-center' })
        }
        fetchItems()
    }

    // ── Single Delete ──────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteId) return
        setDeleting(true)
        try {
            await apiDeleteExamSection(deleteId)
            toast.push(<Notification type="success" title="Section deleted" />, { placement: 'top-center' })
            setDeleteId(null)
            if (items.length === 1 && page > 1) setPage((p) => p - 1)
            else fetchItems()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Delete failed'} />, { placement: 'top-center' })
        } finally {
            setDeleting(false)
        }
    }

    // ── Dialog open/close ──────────────────────────────────────────────────────
    const openCreate = () => {
        setEditItem(null); setForm(EMPTY_FORM); setSelectedParent(null); setDialogOpen(true)
    }

    const openEdit = (item) => {
        setEditItem(item)
        setForm({
            name: item.name || '', type: item.type || '',
            parent_id: item.parent_id ? String(item.parent_id) : '',
            code: item.code || '', description: item.description || '',
            short_name: item.short_name || '',
            sort_order: item.sort_order != null ? String(item.sort_order) : '',
            is_active: item.is_active ?? true, is_featured: item.is_featured ?? false,
        })
        setSelectedParent(item.parent ? { ...item.parent, id: item.parent_id } : null)
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.type) {
            toast.push(<Notification type="warning" title="Name and Type are required" />, { placement: 'top-center' })
            return
        }
        setSaving(true)
        const payload = { name: form.name.trim(), type: form.type, is_active: form.is_active, is_featured: form.is_featured }
        if (selectedParent?.id) payload.parent_id = Number(selectedParent.id)
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

    const typeOptions = [
        { value: '', label: 'All Types' },
        ...(types.length ? types : FALLBACK_TYPES).map((t) => ({ value: t, label: t.replace('_', ' ') })),
    ]
    const activeOptions = [
        { value: '', label: 'All Status' },
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' },
    ]
    const formTypeOptions = (types.length ? types : FALLBACK_TYPES).map((t) => ({
        value: t,
        label: t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' '),
    }))

    const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
    const to = Math.min(page * PER_PAGE, total)

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <TbSitemap className="text-primary" /> Exam Sections
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Exam Group → Exam → Variant → Class → Subject → Chapter → Topic
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button icon={<TbRefresh />} onClick={() => fetchItems()} disabled={loading} />
                    <Button variant="solid" icon={<TbPlus />} onClick={openCreate}>Add Section</Button>
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

            {/* Bulk action bar */}
            {someSelected && (
                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-2.5">
                    <TbSquareCheck className="text-amber-600 text-lg shrink-0" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        {selected.size} section{selected.size > 1 ? 's' : ''} selected
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                        across all pages
                    </span>
                    <div className="ml-auto flex gap-2">
                        <Button
                            size="sm"
                            variant="plain"
                            onClick={() => setSelected(new Set())}
                        >
                            Clear
                        </Button>
                        <Button
                            size="sm"
                            variant="solid"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            icon={<TbTrash />}
                            onClick={() => setBulkDeleteOpen(true)}
                        >
                            Delete {selected.size} selected
                        </Button>
                    </div>
                </div>
            )}

            {/* Tip for bulk delete workflow */}
            {!someSelected && (
                <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-2.5">
                    <TbSelectAll className="text-blue-400 text-base mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        <strong>Tip:</strong> To remove unwanted state sections — search for the state name (e.g. "Andhra Pradesh"), select all rows using the checkbox in the header, then click <strong>Delete selected</strong>. Repeat for each state. Keep Maharashtra sections untouched.
                    </p>
                </div>
            )}

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
                                    <th className="px-4 py-3 w-10">
                                        <button
                                            type="button"
                                            onClick={toggleAll}
                                            className="flex items-center text-gray-400 hover:text-primary transition-colors"
                                            title={allSelected ? 'Deselect all on this page' : 'Select all on this page'}
                                        >
                                            {allSelected
                                                ? <TbSquareCheck className="text-lg text-primary" />
                                                : <TbSquare className="text-lg" />
                                            }
                                        </button>
                                    </th>
                                    <th className="text-left px-4 py-3">Name</th>
                                    <th className="text-left px-4 py-3">Type</th>
                                    <th className="text-left px-4 py-3">Parent</th>
                                    <th className="text-left px-4 py-3">Code</th>
                                    <th className="text-center px-4 py-3">Order</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-right px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {items.map((item) => {
                                    const isSelected = selected.has(item.id)
                                    return (
                                        <tr
                                            key={item.id}
                                            className={`transition-colors ${isSelected ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                                        >
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleOne(item.id)}
                                                    className="flex items-center text-gray-400 hover:text-primary transition-colors"
                                                >
                                                    {isSelected
                                                        ? <TbSquareCheck className="text-lg text-primary" />
                                                        : <TbSquare className="text-lg" />
                                                    }
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800 dark:text-gray-100">{item.name}</div>
                                                {item.short_name && <div className="text-xs text-gray-400">{item.short_name}</div>}
                                                {item.slug && <div className="text-[11px] text-gray-300 dark:text-gray-600 font-mono">{item.slug}</div>}
                                            </td>
                                            <td className="px-4 py-3"><TypeBadge type={item.type} /></td>
                                            <td className="px-4 py-3">
                                                {item.parent ? (
                                                    <div>
                                                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                                                            <TbChevronRight size={12} className="text-gray-400" />
                                                            <span className="font-medium">{item.parent.name}</span>
                                                        </div>
                                                        {item.parent.code && (
                                                            <div className="pl-4 mt-0.5">
                                                                <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-400 px-1 py-0.5 rounded">
                                                                    {item.parent.code}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 dark:text-gray-600 text-xs">— root —</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.code
                                                    ? <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{item.code}</span>
                                                    : <span className="text-gray-300 text-xs">—</span>
                                                }
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-center text-xs">{item.sort_order ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${item.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                    {item.is_active ? <TbCheck size={11} /> : <TbX size={11} />}
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="xs" icon={<TbEdit />} onClick={() => openEdit(item)} />
                                                    <Button
                                                        size="xs" variant="plain"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        icon={<TbTrash />}
                                                        onClick={() => setDeleteId(item.id)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && total > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-500">
                            Showing {from}–{to} of {total} sections
                            {someSelected && <span className="ml-2 font-medium text-amber-600">· {selected.size} selected</span>}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button size="xs" icon={<TbChevronLeft />} disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} />
                            {Array.from({ length: lastPage }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 2)
                                .reduce((acc, p, idx, arr) => {
                                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                                    acc.push(p)
                                    return acc
                                }, [])
                                .map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`e-${idx}`} className="px-2 text-xs text-gray-400">…</span>
                                    ) : (
                                        <button key={p} onClick={() => setPage(p)}
                                            className={`min-w-[28px] h-7 px-2 rounded text-xs font-medium transition-colors ${p === page ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                            {p}
                                        </button>
                                    )
                                )}
                            <Button size="xs" icon={<TbChevronRight />} disabled={page >= lastPage || loading} onClick={() => setPage((p) => p + 1)} />
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} onRequestClose={() => setDialogOpen(false)} width={580}>
                <h5 className="text-lg font-semibold mb-1">{editItem ? 'Edit Section' : 'Add New Section'}</h5>
                <p className="text-xs text-gray-400 mb-5">
                    Hierarchy: Exam Group → Exam → Variant → Class → Subject → Chapter → Topic
                </p>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Maharashtra Board, Class 10, Physics"
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
                            <p className="text-[11px] text-gray-400 mt-1">Level in the hierarchy</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Section</label>
                            <ParentSearchSelect
                                value={selectedParent?.id ? String(selectedParent.id) : ''}
                                onChange={(section) => setSelectedParent(section)}
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Leave empty for root-level sections</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
                            <Input
                                value={form.code}
                                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                                placeholder="e.g. MH_C10_PHY"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Unique identifier code</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Short Name</label>
                            <Input
                                value={form.short_name}
                                onChange={(e) => setForm((f) => ({ ...f, short_name: e.target.value }))}
                                placeholder="e.g. MH Board, C10"
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
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${form.is_active ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</div>
                                <div className="text-[11px] text-gray-400">Visible in public listings</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))}
                                className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${form.is_featured ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</div>
                                <div className="text-[11px] text-gray-400">Highlighted on home page</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
                        <Button variant="solid" onClick={handleSave} loading={saving}>
                            {editItem ? 'Update Section' : 'Create Section'}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Bulk Delete Dialog */}
            <Dialog isOpen={bulkDeleteOpen} onClose={() => !bulkDeleting && setBulkDeleteOpen(false)} onRequestClose={() => !bulkDeleting && setBulkDeleteOpen(false)} width={440}>
                <div className="text-center py-4">
                    <TbAlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
                    <h5 className="text-lg font-semibold mb-2">
                        Delete {selected.size} Section{selected.size > 1 ? 's' : ''}?
                    </h5>
                    <p className="text-sm text-gray-500 mb-2">
                        This will permanently delete all selected sections. Sections that have children will fail and be skipped.
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2 mb-6">
                        Make sure you have not selected any Maharashtra sections before proceeding.
                    </p>
                    {bulkDeleting && (
                        <div className="mb-5">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Deleting…</span>
                                <span>{bulkProgress.done} / {bulkProgress.total}</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-red-500 h-2 rounded-full transition-all"
                                    style={{ width: `${bulkProgress.total ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => setBulkDeleteOpen(false)} disabled={bulkDeleting}>Cancel</Button>
                        <Button
                            variant="solid"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            loading={bulkDeleting}
                            onClick={handleBulkDelete}
                        >
                            Yes, Delete {selected.size}
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Single Delete Dialog */}
            <Dialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onRequestClose={() => setDeleteId(null)} width={400}>
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

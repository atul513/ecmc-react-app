import { useState, useEffect, useCallback } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import DebouceInput from '@/components/shared/DebouceInput'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiGetContactSubmissions,
    apiGetContactSubmission,
    apiUpdateContactStatus,
    apiDeleteContactSubmission,
} from '@/services/ContactService'
import {
    TbSearch, TbTrash, TbEye, TbMail, TbMailOpened,
    TbMailCheck, TbFilter, TbRefresh, TbInbox, TbX,
    TbUser, TbCalendar, TbTag, TbHash, TbClockHour4,
} from 'react-icons/tb'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    new:     { label: 'New',     icon: TbMail,       classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    read:    { label: 'Read',    icon: TbMailOpened,  classes: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    replied: { label: 'Replied', icon: TbMailCheck,   classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new
    const Icon = cfg.icon
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.classes}`}>
            <Icon size={12} /> {cfg.label}
        </span>
    )
}

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'read', label: 'Read' },
    { value: 'replied', label: 'Replied' },
]

const statusUpdateOptions = [
    { value: 'new',     label: 'New' },
    { value: 'read',    label: 'Read' },
    { value: 'replied', label: 'Replied' },
]

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const DetailDialog = ({ id, onClose, onStatusChange, onDelete }) => {
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        apiGetContactSubmission(id)
            .then((res) => setItem(res?.data))
            .catch(() => toast.push(<Notification type="danger" title="Failed to load submission" />, { placement: 'top-center' }))
            .finally(() => setLoading(false))
    }, [id])

    const handleStatus = async (status) => {
        setUpdating(true)
        try {
            await apiUpdateContactStatus(id, status)
            setItem((prev) => ({ ...prev, status }))
            onStatusChange(id, status)
            toast.push(<Notification type="success" title="Status updated" />, { placement: 'top-center' })
        } catch {
            toast.push(<Notification type="danger" title="Update failed" />, { placement: 'top-center' })
        } finally {
            setUpdating(false)
        }
    }

    return (
        <Dialog isOpen onClose={onClose} onRequestClose={onClose} width={560}>
            {loading ? (
                <div className="flex justify-center py-12"><Spinner size="36px" /></div>
            ) : !item ? (
                <div className="text-center py-8 text-gray-400">Submission not found</div>
            ) : (
                <div className="flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h4 className="text-base font-bold heading-text">{item.subject}</h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><TbUser size={13} /> {item.name}</span>
                                <a href={`mailto:${item.email}`} className="flex items-center gap-1 text-primary hover:underline">
                                    <TbMail size={13} /> {item.email}
                                </a>
                                <span className="flex items-center gap-1">
                                    <TbCalendar size={13} /> {dayjs(item.created_at).fromNow()}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
                            <TbX size={20} />
                        </button>
                    </div>

                    {/* Message */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
                        {item.message}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
                            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <TbHash size={12} /> Submission ID
                            </p>
                            <p className="font-medium text-gray-800 dark:text-gray-100">{item.id}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
                            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <TbClockHour4 size={12} /> Received At
                            </p>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                                {dayjs(item.created_at).format('DD MMM YYYY, hh:mm A')}
                            </p>
                        </div>
                    </div>

                    {/* Status + actions */}
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <TbTag size={14} className="text-gray-400" />
                            <Select
                                size="sm"
                                className="w-36"
                                value={statusUpdateOptions.find((o) => o.value === item.status)}
                                options={statusUpdateOptions}
                                isLoading={updating}
                                onChange={(opt) => handleStatus(opt.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject)}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <TbMail size={14} /> Reply via Email
                            </a>
                            <Button
                                size="sm"
                                variant="plain"
                                color="red"
                                icon={<TbTrash />}
                                onClick={() => { onClose(); onDelete(item.id) }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ContactSubmissions = () => {
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [viewId, setViewId] = useState(null)
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
    const [actionLoading, setActionLoading] = useState(null)

    const PER_PAGE = 20

    const fetch = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiGetContactSubmissions({
                page,
                search: search || undefined,
                status: statusFilter || undefined,
            })
            setItems(res?.data ?? [])
            setTotal(res?.total ?? 0)
        } catch {
            toast.push(<Notification type="danger" title="Failed to load submissions" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [page, search, statusFilter])

    useEffect(() => { fetch() }, [fetch])

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1) }, [search, statusFilter])

    const handleStatusChange = (id, status) => {
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, status } : i))
    }

    const handleDeleteConfirm = async () => {
        const { id } = deleteDialog
        setDeleteDialog({ open: false, id: null })
        setActionLoading(id)
        try {
            await apiDeleteContactSubmission(id)
            toast.push(<Notification type="success" title="Submission deleted" />, { placement: 'top-center' })
            fetch()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        } finally {
            setActionLoading(null)
        }
    }

    const totalPages = Math.ceil(total / PER_PAGE)
    const newCount = items.filter((i) => i.status === 'new').length

    return (
        <Container>
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold">Contact Submissions</h3>
                        <p className="text-sm text-gray-500">
                            {total} total
                            {newCount > 0 && (
                                <span className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {newCount} new
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <DebouceInput
                            prefix={<TbSearch className="text-lg" />}
                            placeholder="Search name, email, subject..."
                            value={search}
                            onChange={(val) => setSearch(val)}
                            className="w-56"
                        />
                        <Select
                            size="sm"
                            className="w-36"
                            placeholder="Status"
                            prefix={<TbFilter />}
                            value={statusOptions.find((o) => o.value === statusFilter)}
                            options={statusOptions}
                            onChange={(opt) => setStatusFilter(opt?.value ?? '')}
                        />
                        <Button size="sm" icon={<TbRefresh />} onClick={fetch} loading={loading} />
                    </div>
                </div>

                {/* Table */}
                <AdaptiveCard>
                    {loading ? (
                        <div className="flex justify-center py-16"><Spinner size="36px" /></div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                            <TbInbox size={48} />
                            <p>No submissions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700">
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Received</th>
                                        <th className="py-3 px-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${item.status === 'new' ? 'font-semibold' : ''}`}
                                            onClick={() => setViewId(item.id)}
                                        >
                                            <td className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                                        {item.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span className="heading-text truncate max-w-[120px]">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-gray-500 hidden md:table-cell truncate max-w-[160px]">{item.email}</td>
                                            <td className="py-3 px-3 text-gray-600 dark:text-gray-300 truncate max-w-[180px]">{item.subject}</td>
                                            <td className="py-3 px-3 hidden sm:table-cell">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="py-3 px-3 text-gray-400 text-xs hidden lg:table-cell whitespace-nowrap">
                                                {dayjs(item.created_at).fromNow()}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        icon={<TbEye />}
                                                        onClick={() => setViewId(item.id)}
                                                    />
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        color="red"
                                                        icon={<TbTrash />}
                                                        loading={actionLoading === item.id}
                                                        onClick={() => setDeleteDialog({ open: true, id: item.id })}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </AdaptiveCard>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Page {page} of {totalPages} ({total} total)</span>
                        <div className="flex gap-2">
                            <Button size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                            <Button size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {viewId && (
                <DetailDialog
                    id={viewId}
                    onClose={() => setViewId(null)}
                    onStatusChange={handleStatusChange}
                    onDelete={(id) => setDeleteDialog({ open: true, id })}
                />
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                isOpen={deleteDialog.open}
                type="danger"
                title="Delete submission"
                confirmButtonColor="red-600"
                onClose={() => setDeleteDialog({ open: false, id: null })}
                onRequestClose={() => setDeleteDialog({ open: false, id: null })}
                onCancel={() => setDeleteDialog({ open: false, id: null })}
                onConfirm={handleDeleteConfirm}
            >
                <p>Are you sure you want to delete this submission? This cannot be undone.</p>
            </ConfirmDialog>
        </Container>
    )
}

export default ContactSubmissions

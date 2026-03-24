import { useState, useEffect, useCallback, useMemo } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import DebouceInput from '@/components/shared/DebouceInput'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Tag from '@/components/ui/Tag'
import Tooltip from '@/components/ui/Tooltip'
import Checkbox from '@/components/ui/Checkbox'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiGetBlogComments,
    apiUpdateCommentStatus,
    apiBulkUpdateCommentStatus,
    apiDeleteComment,
} from '@/services/BlogService'
import { TbSearch, TbTrash, TbCheck, TbX, TbBan } from 'react-icons/tb'

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'spam', label: 'Spam' },
    { value: 'rejected', label: 'Rejected' },
]

const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    approved: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    spam: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
    rejected: 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300',
}

const CommentList = () => {
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [query, setQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const [selected, setSelected] = useState([])
    const [deleteId, setDeleteId] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [bulkLoading, setBulkLoading] = useState(false)

    const fetchComments = useCallback(async () => {
        setLoading(true)
        try {
            const res = await apiGetBlogComments({
                page: pageIndex,
                per_page: pageSize,
                search: query || undefined,
                status: statusFilter || undefined,
            })
            setData(res?.data?.data || res?.data || [])
            setTotal(res?.data?.total || res?.total || 0)
        } catch {
            toast.push(<Notification type="danger" title="Failed to load comments" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, query, statusFilter])

    useEffect(() => { fetchComments() }, [fetchComments])

    const handleStatusChange = async (id, status) => {
        setActionLoading(id)
        try {
            await apiUpdateCommentStatus(id, status)
            toast.push(<Notification type="success" title={`Comment marked as ${status}`} />, { placement: 'top-center' })
            fetchComments()
        } catch {
            toast.push(<Notification type="danger" title="Status update failed" />, { placement: 'top-center' })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await apiDeleteComment(deleteId)
            toast.push(<Notification type="success" title="Comment deleted" />, { placement: 'top-center' })
            setDeleteId(null)
            setSelected((prev) => prev.filter((id) => id !== deleteId))
            fetchComments()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        }
    }

    const handleBulkStatus = async (status) => {
        if (!selected.length) return
        setBulkLoading(true)
        try {
            await apiBulkUpdateCommentStatus(selected, status)
            toast.push(<Notification type="success" title={`${selected.length} comments marked as ${status}`} />, { placement: 'top-center' })
            setSelected([])
            fetchComments()
        } catch {
            toast.push(<Notification type="danger" title="Bulk update failed" />, { placement: 'top-center' })
        } finally {
            setBulkLoading(false)
        }
    }

    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (selected.length === data.length) {
            setSelected([])
        } else {
            setSelected(data.map((c) => c.id))
        }
    }

    const columns = useMemo(() => [
        {
            header: () => (
                <Checkbox
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={toggleAll}
                />
            ),
            id: 'select',
            cell: (props) => (
                <Checkbox
                    checked={selected.includes(props.row.original.id)}
                    onChange={() => toggleSelect(props.row.original.id)}
                />
            ),
        },
        {
            header: 'Comment',
            accessorKey: 'content',
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex flex-col gap-1 max-w-[300px]">
                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{row.content}</p>
                        <span className="text-xs text-gray-500">
                            on: <span className="font-medium">{row.blog?.title || '—'}</span>
                        </span>
                    </div>
                )
            },
        },
        {
            header: 'Author',
            accessorKey: 'author_name',
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{row.author_name || row.user?.name || '—'}</span>
                        <span className="text-xs text-gray-500">{row.author_email || row.user?.email || ''}</span>
                    </div>
                )
            },
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (props) => {
                const status = props.row.original.status
                return (
                    <Tag className={`font-semibold capitalize ${statusColors[status] || statusColors.pending}`}>
                        {status}
                    </Tag>
                )
            },
        },
        {
            header: 'Date',
            accessorKey: 'created_at',
            cell: (props) => {
                const val = props.row.original.created_at
                return <span className="text-sm text-gray-500">{val ? new Date(val).toLocaleDateString() : '—'}</span>
            },
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (props) => {
                const row = props.row.original
                const isActive = actionLoading === row.id
                return (
                    <div className="flex items-center gap-1">
                        {row.status !== 'approved' && (
                            <Tooltip title="Approve">
                                <Button
                                    size="xs"
                                    icon={<TbCheck className="text-emerald-500" />}
                                    variant="plain"
                                    loading={isActive}
                                    onClick={() => handleStatusChange(row.id, 'approved')}
                                />
                            </Tooltip>
                        )}
                        {row.status !== 'spam' && (
                            <Tooltip title="Mark as Spam">
                                <Button
                                    size="xs"
                                    icon={<TbBan className="text-orange-500" />}
                                    variant="plain"
                                    loading={isActive}
                                    onClick={() => handleStatusChange(row.id, 'spam')}
                                />
                            </Tooltip>
                        )}
                        {row.status !== 'rejected' && (
                            <Tooltip title="Reject">
                                <Button
                                    size="xs"
                                    icon={<TbX className="text-red-400" />}
                                    variant="plain"
                                    loading={isActive}
                                    onClick={() => handleStatusChange(row.id, 'rejected')}
                                />
                            </Tooltip>
                        )}
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
    ], [data, selected, actionLoading])

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3 className="text-lg font-semibold">Blog Comments</h3>
                        {selected.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{selected.length} selected</span>
                                <Button
                                    size="sm"
                                    icon={<TbCheck />}
                                    loading={bulkLoading}
                                    onClick={() => handleBulkStatus('approved')}
                                >
                                    Approve All
                                </Button>
                                <Button
                                    size="sm"
                                    icon={<TbBan />}
                                    loading={bulkLoading}
                                    onClick={() => handleBulkStatus('spam')}
                                >
                                    Spam All
                                </Button>
                                <Button
                                    size="sm"
                                    icon={<TbX />}
                                    loading={bulkLoading}
                                    onClick={() => handleBulkStatus('rejected')}
                                >
                                    Reject All
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <DebouceInput
                            className="flex-1"
                            placeholder="Search comments..."
                            prefix={<TbSearch className="text-lg" />}
                            onChange={(e) => { setQuery(e.target.value); setPageIndex(1) }}
                        />
                        <Select
                            className="min-w-[150px]"
                            options={statusOptions}
                            defaultValue={statusOptions[0]}
                            onChange={(opt) => { setStatusFilter(opt?.value || ''); setPageIndex(1) }}
                        />
                    </div>

                    {/* Table */}
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

            <ConfirmDialog
                isOpen={!!deleteId}
                type="danger"
                title="Delete Comment"
                onClose={() => setDeleteId(null)}
                onRequestClose={() => setDeleteId(null)}
                onCancel={() => setDeleteId(null)}
                onConfirm={handleDelete}
            >
                <p>Are you sure you want to permanently delete this comment?</p>
            </ConfirmDialog>
        </Container>
    )
}

export default CommentList

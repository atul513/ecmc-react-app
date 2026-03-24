import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Container from '@/components/shared/Container'
import DataTable from '@/components/shared/DataTable'
import DebouceInput from '@/components/shared/DebouceInput'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Tooltip from '@/components/ui/Tooltip'
import Tag from '@/components/ui/Tag'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import BlogStatusBadge from './components/BlogStatusBadge'
import {
    apiGetBlogs,
    apiDeleteBlog,
    apiRestoreBlog,
    apiForceDeleteBlog,
    apiUpdateBlogStatus,
    apiToggleBlogFeatured,
} from '@/services/BlogService'
import {
    TbPlus,
    TbSearch,
    TbPencil,
    TbTrash,
    TbRefresh,
    TbTrashX,
    TbStar,
    TbStarFilled,
    TbFilter,
} from 'react-icons/tb'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'

const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'archived', label: 'Archived' },
]

const trashedOptions = [
    { value: '', label: 'Active' },
    { value: '1', label: 'Trashed' },
]

const BlogList = () => {
    const navigate = useNavigate()

    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [query, setQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [trashedFilter, setTrashedFilter] = useState('')
    const [sortKey, setSortKey] = useState('created_at')
    const [sortOrder, setSortOrder] = useState('desc')

    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, mode: 'soft' })
    const [actionLoading, setActionLoading] = useState(null)

    const fetchBlogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = {
                page: pageIndex,
                per_page: pageSize,
                search: query || undefined,
                status: statusFilter || undefined,
                trashed: trashedFilter || undefined,
                sort_by: sortKey,
                sort_order: sortOrder,
            }
            const res = await apiGetBlogs(params)
            setData(res?.data?.data || res?.data || [])
            setTotal(res?.data?.total || res?.total || 0)
        } catch (e) {
            toast.push(<Notification type="danger" title="Failed to load blogs" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, query, statusFilter, trashedFilter, sortKey, sortOrder])

    useEffect(() => { fetchBlogs() }, [fetchBlogs])

    const handleSort = ({ key, order }) => {
        setSortKey(key)
        setSortOrder(order)
    }

    const handleDelete = (id) => setDeleteDialog({ open: true, id, mode: 'soft' })
    const handleForceDelete = (id) => setDeleteDialog({ open: true, id, mode: 'force' })

    const confirmDelete = async () => {
        const { id, mode } = deleteDialog
        setDeleteDialog({ open: false, id: null, mode: 'soft' })
        setActionLoading(id)
        try {
            if (mode === 'force') {
                await apiForceDeleteBlog(id)
                toast.push(<Notification type="success" title="Blog permanently deleted" />, { placement: 'top-center' })
            } else {
                await apiDeleteBlog(id)
                toast.push(<Notification type="success" title="Blog moved to trash" />, { placement: 'top-center' })
            }
            fetchBlogs()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        } finally {
            setActionLoading(null)
        }
    }

    const handleRestore = async (id) => {
        setActionLoading(id)
        try {
            await apiRestoreBlog(id)
            toast.push(<Notification type="success" title="Blog restored" />, { placement: 'top-center' })
            fetchBlogs()
        } catch {
            toast.push(<Notification type="danger" title="Restore failed" />, { placement: 'top-center' })
        } finally {
            setActionLoading(null)
        }
    }

    const handleStatusChange = async (id, status) => {
        setActionLoading(id)
        try {
            await apiUpdateBlogStatus(id, status)
            toast.push(<Notification type="success" title="Status updated" />, { placement: 'top-center' })
            fetchBlogs()
        } catch {
            toast.push(<Notification type="danger" title="Status update failed" />, { placement: 'top-center' })
        } finally {
            setActionLoading(null)
        }
    }

    const handleToggleFeatured = async (id) => {
        setActionLoading(id)
        try {
            await apiToggleBlogFeatured(id)
            fetchBlogs()
        } catch {
            toast.push(<Notification type="danger" title="Failed to toggle featured" />, { placement: 'top-center' })
        } finally {
            setActionLoading(null)
        }
    }

    const columns = useMemo(() => [
        {
            header: 'Title',
            accessorKey: 'title',
            cell: (props) => {
                const row = props.row.original
                return (
                    <div className="flex flex-col gap-1 max-w-[280px]">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{row.title}</span>
                        {row.category && (
                            <span className="text-xs text-gray-500">{row.category?.name}</span>
                        )}
                    </div>
                )
            },
        },
        {
            header: 'Author',
            accessorKey: 'author',
            cell: (props) => {
                const author = props.row.original.author
                return <span className="text-sm">{author?.name || author?.full_name || '—'}</span>
            },
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (props) => <BlogStatusBadge status={props.row.original.status} />,
        },
        {
            header: 'Featured',
            accessorKey: 'is_featured',
            cell: (props) => {
                const row = props.row.original
                return (
                    <button
                        className="text-xl text-yellow-400 hover:text-yellow-500 transition-colors"
                        onClick={() => handleToggleFeatured(row.id)}
                        disabled={actionLoading === row.id}
                    >
                        {row.is_featured ? <TbStarFilled /> : <TbStar className="text-gray-400" />}
                    </button>
                )
            },
        },
        {
            header: 'Published',
            accessorKey: 'published_at',
            cell: (props) => {
                const val = props.row.original.published_at
                return <span className="text-sm text-gray-500">{val ? new Date(val).toLocaleDateString() : '—'}</span>
            },
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (props) => {
                const row = props.row.original
                const isActive = actionLoading === row.id
                if (row.deleted_at) {
                    return (
                        <div className="flex items-center gap-2">
                            <Tooltip title="Restore">
                                <Button
                                    size="xs"
                                    icon={<TbRefresh />}
                                    loading={isActive}
                                    onClick={() => handleRestore(row.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Delete Permanently">
                                <Button
                                    size="xs"
                                    variant="plain"
                                    icon={<TbTrashX className="text-red-500" />}
                                    loading={isActive}
                                    onClick={() => handleForceDelete(row.id)}
                                />
                            </Tooltip>
                        </div>
                    )
                }
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip title="Edit">
                            <Button
                                size="xs"
                                icon={<TbPencil />}
                                onClick={() => navigate(`${ECMC_PREFIX_PATH}/blog/edit/${row.id}`)}
                            />
                        </Tooltip>
                        <Tooltip title="Move to Trash">
                            <Button
                                size="xs"
                                variant="plain"
                                icon={<TbTrash className="text-red-500" />}
                                loading={isActive}
                                onClick={() => handleDelete(row.id)}
                            />
                        </Tooltip>
                    </div>
                )
            },
        },
    ], [actionLoading, navigate])

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3 className="text-lg font-semibold">Blog Posts</h3>
                        <Button
                            variant="solid"
                            icon={<TbPlus />}
                            onClick={() => navigate(`${ECMC_PREFIX_PATH}/blog/create`)}
                        >
                            New Post
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <DebouceInput
                            className="flex-1"
                            placeholder="Search by title..."
                            prefix={<TbSearch className="text-lg" />}
                            onChange={(e) => { setQuery(e.target.value); setPageIndex(1) }}
                        />
                        <Select
                            className="min-w-[150px]"
                            options={statusOptions}
                            defaultValue={statusOptions[0]}
                            onChange={(opt) => { setStatusFilter(opt?.value || ''); setPageIndex(1) }}
                        />
                        <Select
                            className="min-w-[140px]"
                            options={trashedOptions}
                            defaultValue={trashedOptions[0]}
                            onChange={(opt) => { setTrashedFilter(opt?.value || ''); setPageIndex(1) }}
                        />
                    </div>

                    {/* Table */}
                    <DataTable
                        columns={columns}
                        data={data}
                        loading={loading}
                        pagingData={{ total, pageIndex, pageSize }}
                        onPaginationChange={(page) => setPageIndex(page)}
                        onSelectChange={(size) => { setPageSize(size); setPageIndex(1) }}
                        onSort={handleSort}
                    />
                </div>
            </AdaptiveCard>

            <ConfirmDialog
                isOpen={deleteDialog.open}
                type="danger"
                title={deleteDialog.mode === 'force' ? 'Permanently Delete Blog' : 'Move to Trash'}
                onClose={() => setDeleteDialog({ open: false, id: null, mode: 'soft' })}
                onRequestClose={() => setDeleteDialog({ open: false, id: null, mode: 'soft' })}
                onCancel={() => setDeleteDialog({ open: false, id: null, mode: 'soft' })}
                onConfirm={confirmDelete}
            >
                <p>
                    {deleteDialog.mode === 'force'
                        ? 'This action is irreversible. The blog post will be permanently deleted.'
                        : 'This blog post will be moved to trash. You can restore it later.'}
                </p>
            </ConfirmDialog>
        </Container>
    )
}

export default BlogList

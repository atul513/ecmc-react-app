import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Dialog from '@/components/ui/Dialog'
import Pagination from '@/components/ui/Pagination'
import {
    apiGetPracticeSets,
    apiDeletePracticeSet,
    apiPublishPracticeSet,
} from '@/services/PracticeSetService'
import { apiGetQuizCategories } from '@/services/QuizService'
import { apiGetSubjects } from '@/services/QBankService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import ShareInvitePanel from '@/views/share/ShareInvitePanel'
import {
    TbPlus,
    TbPencil,
    TbTrash,
    TbSearch,
    TbPlayerPlay,
    TbStar,
    TbShare,
} from 'react-icons/tb'
import Tooltip from '@/components/ui/Tooltip'

const { THead, TBody, Tr, Th, Td } = Table

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
]
const ACCESS_OPTIONS = [
    { value: '', label: 'All Access' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
]

const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim()
const DESC_LIMIT = 80

const DescCell = ({ html }) => {
    const [expanded, setExpanded] = useState(false)
    const plain = stripHtml(html)
    if (!plain) return null
    const isLong = plain.length > DESC_LIMIT
    return (
        <div className="text-xs text-gray-400 mt-0.5 max-w-xs">
            {isLong && !expanded ? plain.slice(0, DESC_LIMIT) + '…' : plain}
            {isLong && (
                <button
                    type="button"
                    className="ml-1 text-primary underline text-xs"
                    onClick={() => setExpanded((v) => !v)}
                >
                    {expanded ? 'less' : 'more'}
                </button>
            )}
        </div>
    )
}

const statusBadge = (status) => {
    const map = {
        draft: 'bg-yellow-100 text-yellow-700',
        published: 'bg-emerald-100 text-emerald-700',
    }
    return (
        <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}
        >
            {status}
        </span>
    )
}

const PracticeSetList = () => {
    const navigate = useNavigate()
    const [sets, setSets] = useState([])
    const [categories, setCategories] = useState([])
    const [subjects, setSubjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({
        status: '',
        access_type: '',
        category_id: '',
        subject_id: '',
        topic_id: '',
        page: 1,
        per_page: 15,
    })
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        item: null,
    })
    const [shareItem, setShareItem] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    //const [shareItem, setShareItem] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== ''),
            )
            if (search) params.search = search
            const res = await apiGetPracticeSets(params)
            setSets(res?.data || [])
            setTotal(res?.pagination?.total || res?.meta?.total || 0)
        } catch {
            toast.push(
                <Notification
                    type="danger"
                    title="Failed to load practice sets"
                />,
                { placement: 'top-center' },
            )
        } finally {
            setLoading(false)
        }
    }, [filters, search])

    useEffect(() => {
        load()
    }, [load])
    useEffect(() => {
        apiGetQuizCategories()
            .then((res) => setCategories(res?.data || []))
            .catch(() => {})
        apiGetSubjects({ active_only: true })
            .then((res) => setSubjects(res?.data || []))
            .catch(() => {})
    }, [])

    const categoryOptions = useMemo(
        () => [
            { value: '', label: 'All Categories' },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
        ],
        [categories],
    )
    const subjectOptions = useMemo(
        () => [
            { value: '', label: 'All Subjects' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
        ],
        [subjects],
    )

    const setFilter = (key, val) =>
        setFilters((prev) => ({ ...prev, [key]: val, page: 1 }))

    const handlePublish = async (item) => {
        setActionLoading(item.id)
        try {
            await apiPublishPracticeSet(item.id)
            toast.push(
                <Notification type="success" title="Published successfully" />,
                { placement: 'top-center' },
            )
            load()
        } catch {
            toast.push(<Notification type="danger" title="Publish failed" />, {
                placement: 'top-center',
            })
        } finally {
            setActionLoading(null)
        }
    }

    const confirmDelete = async () => {
        try {
            await apiDeletePracticeSet(deleteDialog.item.id)
            toast.push(<Notification type="success" title="Deleted" />, {
                placement: 'top-center',
            })
            setDeleteDialog({ open: false, item: null })
            load()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, {
                placement: 'top-center',
            })
        }
    }

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <h3 className="text-lg font-semibold">
                            Practice Sets{' '}
                            {total > 0 && (
                                <span className="text-sm font-normal text-gray-400">
                                    ({total})
                                </span>
                            )}
                        </h3>
                        <Button
                            variant="solid"
                            icon={<TbPlus />}
                            onClick={() =>
                                navigate(`${ECMC_PREFIX_PATH}/practice/create`)
                            }
                        >
                            Create Practice Set
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Input
                            prefix={<TbSearch />}
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setFilters((f) => ({ ...f, page: 1 }))
                            }}
                            className="w-48"
                        />
                        <Select
                            options={STATUS_OPTIONS}
                            value={STATUS_OPTIONS.find(
                                (o) => o.value === filters.status,
                            )}
                            onChange={(opt) =>
                                setFilter('status', opt?.value ?? '')
                            }
                            className="w-36"
                            placeholder="Status"
                        />
                        <Select
                            options={ACCESS_OPTIONS}
                            value={ACCESS_OPTIONS.find(
                                (o) => o.value === filters.access_type,
                            )}
                            onChange={(opt) =>
                                setFilter('access_type', opt?.value ?? '')
                            }
                            className="w-36"
                            placeholder="Access"
                        />
                        <Select
                            options={categoryOptions}
                            value={categoryOptions.find(
                                (o) => o.value === filters.category_id,
                            )}
                            onChange={(opt) =>
                                setFilter('category_id', opt?.value ?? '')
                            }
                            className="w-44"
                            placeholder="Category"
                        />
                        <Select
                            options={subjectOptions}
                            value={subjectOptions.find(
                                (o) => o.value === filters.subject_id,
                            )}
                            onChange={(opt) =>
                                setFilter('subject_id', opt?.value ?? '')
                            }
                            className="w-40"
                            placeholder="Subject"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="40px" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="min-w-[700px] px-4 sm:px-0">
                                    <Table>
                                        <THead>
                                            <Tr>
                                                <Th>Title</Th>
                                                <Th>Subject</Th>
                                                <Th>Questions</Th>
                                                <Th>Access</Th>
                                                <Th>Rewards</Th>
                                                <Th>Status</Th>
                                                <Th>Actions</Th>
                                            </Tr>
                                        </THead>
                                        <TBody>
                                            {sets.length === 0 ? (
                                                <Tr>
                                                    <Td
                                                        colSpan={7}
                                                        className="text-center text-gray-400 py-8"
                                                    >
                                                        No practice sets found
                                                    </Td>
                                                </Tr>
                                            ) : (
                                                sets.map((s) => (
                                                    <Tr key={s.id}>
                                                        <Td>
                                                            <div className="font-medium">
                                                                {s.title}
                                                            </div>
                                                            <DescCell
                                                                html={
                                                                    s.description
                                                                }
                                                            />
                                                        </Td>
                                                        <Td className="text-sm">
                                                            {s.subject?.name ??
                                                                '—'}
                                                        </Td>
                                                        <Td className="text-sm">
                                                            {s.questions_count ??
                                                                s.total_questions ??
                                                                '—'}
                                                        </Td>
                                                        <Td>
                                                            <span
                                                                className={`text-xs px-2 py-1 rounded-full font-medium ${s.access_type === 'paid' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}
                                                            >
                                                                {s.access_type}
                                                            </span>
                                                        </Td>
                                                        <Td>
                                                            {s.allow_reward_points ? (
                                                                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                                                    <TbStar />{' '}
                                                                    {
                                                                        s.points_mode
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">
                                                                    None
                                                                </span>
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            {statusBadge(
                                                                s.status,
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            <div className="flex gap-1">
                                                                <Tooltip title="Edit">
                                                                    <Button
                                                                        size="xs"
                                                                        icon={
                                                                            <TbPencil />
                                                                        }
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `${ECMC_PREFIX_PATH}/practice/edit/${s.id}`,
                                                                            )
                                                                        }
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title="Share / Invite">
                                                                    <Button
                                                                        size="xs"
                                                                        variant="plain"
                                                                        className="text-blue-500"
                                                                        icon={
                                                                            <TbShare />
                                                                        }
                                                                        onClick={() =>
                                                                            setShareItem(
                                                                                s,
                                                                            )
                                                                        }
                                                                    />
                                                                </Tooltip>
                                                                {s.status ===
                                                                    'draft' && (
                                                                    <Button
                                                                        size="xs"
                                                                        variant="plain"
                                                                        className="text-emerald-600"
                                                                        icon={
                                                                            <TbPlayerPlay />
                                                                        }
                                                                        loading={
                                                                            actionLoading ===
                                                                            s.id
                                                                        }
                                                                        onClick={() =>
                                                                            handlePublish(
                                                                                s,
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                                <Button
                                                                    size="xs"
                                                                    variant="plain"
                                                                    className="text-blue-500"
                                                                    icon={
                                                                        <TbShare />
                                                                    }
                                                                    onClick={() =>
                                                                        setShareItem(
                                                                            s,
                                                                        )
                                                                    }
                                                                />
                                                                <Button
                                                                    size="xs"
                                                                    variant="plain"
                                                                    className="text-red-500"
                                                                    icon={
                                                                        <TbTrash />
                                                                    }
                                                                    onClick={() =>
                                                                        setDeleteDialog(
                                                                            {
                                                                                open: true,
                                                                                item: s,
                                                                            },
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </Td>
                                                    </Tr>
                                                ))
                                            )}
                                        </TBody>
                                    </Table>
                                </div>
                            </div>

                            {total > filters.per_page && (
                                <div className="flex justify-end mt-2">
                                    <Pagination
                                        total={total}
                                        pageSize={filters.per_page}
                                        currentPage={filters.page}
                                        onChange={(page) =>
                                            setFilters((f) => ({ ...f, page }))
                                        }
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </AdaptiveCard>

            <ShareInvitePanel
                isOpen={!!shareItem}
                onClose={() => setShareItem(null)}
                contentType="practice_set"
                contentId={shareItem?.id}
                contentTitle={shareItem?.title}
            />

            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, item: null })}
                onRequestClose={() =>
                    setDeleteDialog({ open: false, item: null })
                }
            >
                <h5 className="mb-2 font-semibold">Delete Practice Set</h5>
                <p className="text-sm text-gray-500 mb-6">
                    Delete <strong>{deleteDialog.item?.title}</strong>? This
                    cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={() =>
                            setDeleteDialog({ open: false, item: null })
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={confirmDelete}
                    >
                        Delete
                    </Button>
                </div>
            </Dialog>

            {shareItem && (
                <ShareInvitePanel
                    isOpen={!!shareItem}
                    onClose={() => setShareItem(null)}
                    contentType="practice_set"
                    contentId={shareItem.id}
                    contentTitle={shareItem.title}
                />
            )}
        </Container>
    )
}

export default PracticeSetList

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
import { apiGetQuizzes, apiDeleteQuiz, apiPublishQuiz, apiArchiveQuiz, apiGetQuizCategories } from '@/services/QuizService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import {
    TbPlus, TbPencil, TbTrash, TbSearch, TbPlayerPlay, TbArchive,
} from 'react-icons/tb'

const { THead, TBody, Tr, Th, Td } = Table

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'exam', label: 'Exam' },
]
const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
]
const VISIBILITY_OPTIONS = [
    { value: '', label: 'All Visibility' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
]
const ACCESS_OPTIONS = [
    { value: '', label: 'All Access' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
]

const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim()

const DESC_LIMIT = 80

const DescriptionCell = ({ html }) => {
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
        archived: 'bg-gray-100 text-gray-500',
    }
    return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
            {status}
        </span>
    )
}

const QuizList = () => {
    const navigate = useNavigate()
    const [quizzes, setQuizzes] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({
        type: '', status: '', visibility: '', access_type: '', category_id: '', page: 1, per_page: 15,
    })
    const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null })
    const [actionLoading, setActionLoading] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
            if (search) params.search = search
            const res = await apiGetQuizzes(params)
            setQuizzes(res?.data || [])
            setTotal(res?.pagination?.total || res?.meta?.total || 0)
        } catch {
            toast.push(<Notification type="danger" title="Failed to load quizzes" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [filters, search])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        apiGetQuizCategories().then((res) => setCategories(res?.data || [])).catch(() => {})
    }, [])

    const categoryOptions = useMemo(
        () => [{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
        [categories]
    )

    const handlePublish = async (quiz) => {
        setActionLoading(quiz.id + '_publish')
        try {
            await apiPublishQuiz(quiz.id)
            toast.push(<Notification type="success" title="Quiz published" />, { placement: 'top-center' })
            load()
        } catch {
            toast.push(<Notification type="danger" title="Publish failed" />, { placement: 'top-center' })
        } finally {
            setActionLoading(null)
        }
    }

    const handleArchive = async (quiz) => {
        setActionLoading(quiz.id + '_archive')
        try {
            await apiArchiveQuiz(quiz.id)
            toast.push(<Notification type="success" title="Quiz archived" />, { placement: 'top-center' })
            load()
        } catch {
            toast.push(<Notification type="danger" title="Archive failed" />, { placement: 'top-center' })
        } finally {
            setActionLoading(null)
        }
    }

    const confirmDelete = async () => {
        try {
            await apiDeleteQuiz(deleteDialog.item.id)
            toast.push(<Notification type="success" title="Quiz deleted" />, { placement: 'top-center' })
            setDeleteDialog({ open: false, item: null })
            load()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        }
    }

    const setFilter = (key, val) =>
        setFilters((prev) => ({ ...prev, [key]: val, page: 1 }))

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <h3 className="text-lg font-semibold">
                            Quizzes & Exams{' '}
                            {total > 0 && <span className="text-sm font-normal text-gray-400">({total})</span>}
                        </h3>
                        <Button variant="solid" icon={<TbPlus />} onClick={() => navigate(`${ECMC_PREFIX_PATH}/quiz/create`)}>
                            Create Quiz
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Input
                            prefix={<TbSearch />}
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setFilters((f) => ({ ...f, page: 1 })) }}
                            className="w-48"
                        />
                        <Select
                            options={TYPE_OPTIONS}
                            value={TYPE_OPTIONS.find((o) => o.value === filters.type)}
                            onChange={(opt) => setFilter('type', opt?.value ?? '')}
                            className="w-36"
                            placeholder="Type"
                        />
                        <Select
                            options={STATUS_OPTIONS}
                            value={STATUS_OPTIONS.find((o) => o.value === filters.status)}
                            onChange={(opt) => setFilter('status', opt?.value ?? '')}
                            className="w-36"
                            placeholder="Status"
                        />
                        <Select
                            options={VISIBILITY_OPTIONS}
                            value={VISIBILITY_OPTIONS.find((o) => o.value === filters.visibility)}
                            onChange={(opt) => setFilter('visibility', opt?.value ?? '')}
                            className="w-36"
                            placeholder="Visibility"
                        />
                        <Select
                            options={ACCESS_OPTIONS}
                            value={ACCESS_OPTIONS.find((o) => o.value === filters.access_type)}
                            onChange={(opt) => setFilter('access_type', opt?.value ?? '')}
                            className="w-36"
                            placeholder="Access"
                        />
                        <Select
                            options={categoryOptions}
                            value={categoryOptions.find((o) => o.value === filters.category_id)}
                            onChange={(opt) => setFilter('category_id', opt?.value ?? '')}
                            className="w-44"
                            placeholder="Category"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner size="40px" /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="min-w-[800px] px-4 sm:px-0">
                                <Table>
                                <THead>
                                    <Tr>
                                        <Th>Title</Th>
                                        <Th>Type</Th>
                                        <Th>Category</Th>
                                        <Th>Questions</Th>
                                        <Th>Duration</Th>
                                        <Th>Access</Th>
                                        <Th>Visibility</Th>
                                        <Th>Status</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {quizzes.length === 0 ? (
                                        <Tr><Td colSpan={9} className="text-center text-gray-400 py-8">No quizzes found</Td></Tr>
                                    ) : quizzes.map((q) => (
                                        <Tr key={q.id}>
                                            <Td>
                                                <div className="font-medium">{q.title}</div>
                                                <DescriptionCell html={q.description} />
                                            </Td>
                                            <Td>
                                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700 capitalize">
                                                    {q.type}
                                                </span>
                                            </Td>
                                            <Td className="text-sm">{q.category?.name ?? '—'}</Td>
                                            <Td className="text-sm">{q.questions_count ?? '—'}</Td>
                                            <Td className="text-sm">
                                                {q.duration_mode === 'manual' ? `${q.total_duration_min} min` : 'No limit'}
                                            </Td>
                                            <Td>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${q.access_type === 'paid' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {q.access_type}
                                                </span>
                                            </Td>
                                            <Td>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${q.visibility === 'public' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {q.visibility}
                                                </span>
                                            </Td>
                                            <Td>{statusBadge(q.status)}</Td>
                                            <Td>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="xs"
                                                        icon={<TbPencil />}
                                                        onClick={() => navigate(`${ECMC_PREFIX_PATH}/quiz/edit/${q.id}`)}
                                                    />
                                                    {q.status === 'draft' && (
                                                        <Button
                                                            size="xs"
                                                            variant="plain"
                                                            className="text-emerald-600"
                                                            icon={<TbPlayerPlay />}
                                                            loading={actionLoading === q.id + '_publish'}
                                                            onClick={() => handlePublish(q)}
                                                        />
                                                    )}
                                                    {q.status === 'published' && (
                                                        <Button
                                                            size="xs"
                                                            variant="plain"
                                                            className="text-gray-500"
                                                            icon={<TbArchive />}
                                                            loading={actionLoading === q.id + '_archive'}
                                                            onClick={() => handleArchive(q)}
                                                        />
                                                    )}
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        className="text-red-500"
                                                        icon={<TbTrash />}
                                                        onClick={() => setDeleteDialog({ open: true, item: q })}
                                                    />
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}
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
                                        onChange={(page) => setFilters((f) => ({ ...f, page }))}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </AdaptiveCard>

            <Dialog
                isOpen={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, item: null })}
                onRequestClose={() => setDeleteDialog({ open: false, item: null })}
            >
                <h5 className="mb-2 font-semibold">Delete Quiz</h5>
                <p className="text-sm text-gray-500 mb-6">
                    Delete <strong>{deleteDialog.item?.title}</strong>? This cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                    <Button onClick={() => setDeleteDialog({ open: false, item: null })}>Cancel</Button>
                    <Button variant="solid" className="bg-red-500 hover:bg-red-600" onClick={confirmDelete}>Delete</Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default QuizList

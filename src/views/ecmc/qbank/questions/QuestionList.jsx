import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Dialog from '@/components/ui/Dialog'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Pagination from '@/components/ui/Pagination'
import Checkbox from '@/components/ui/Checkbox'
import Table from '@/components/ui/Table'

const { THead, TBody, Tr, Th, Td } = Table
import {
    apiGetQuestions,
    apiGetSubjects,
    apiDeleteQuestion,
    apiSubmitQuestionForReview,
    apiApproveQuestion,
    apiRejectQuestion,
    apiCloneQuestion,
    apiBulkUpdateQuestionStatus,
} from '@/services/QBankService'
import {
    TbPlus, TbSearch, TbPencil, TbTrash, TbCopy, TbSend, TbCircleCheck, TbFileImport,
    TbCircleX, TbFilter, TbX,
} from 'react-icons/tb'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'

const TYPE_OPTIONS = [
    { value: 'mcq', label: 'MCQ' },
    { value: 'multi_select', label: 'Multi-Select' },
    { value: 'true_false', label: 'True / False' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'long_answer', label: 'Long Answer' },
    { value: 'fill_blank', label: 'Fill in the Blank' },
    { value: 'match_column', label: 'Match the Column' },
]

const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
    { value: 'expert', label: 'Expert' },
]

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'archived', label: 'Archived' },
]

const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    review: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    archived: 'bg-blue-100 text-blue-700',
}

const diffColors = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-orange-100 text-orange-700',
    expert: 'bg-red-100 text-red-700',
}

const QuestionList = () => {
    const navigate = useNavigate()
    const [questions, setQuestions] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [subjects, setSubjects] = useState([])
    const [selected, setSelected] = useState([])
    const [rejectDialog, setRejectDialog] = useState({ open: false, id: null })
    const [rejectReason, setRejectReason] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })

    const [filters, setFilters] = useState({
        subject_id: '',
        type: '',
        difficulty: '',
        status: '',
        search: '',
        page: 1,
        per_page: 25,
    })

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
            const res = await apiGetQuestions(params)
            setQuestions(res?.data || [])
            setTotal(res?.pagination?.total || 0)
        } catch {
            toast.push(<Notification type="danger" title="Failed to load questions" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        apiGetSubjects({ active_only: true }).then((res) => {
            setSubjects((res?.data || []).map((s) => ({ value: s.id, label: s.name })))
        }).catch(() => {})
    }, [])

    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }))

    const toggleSelect = (id) => {
        setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
    }

    const toggleSelectAll = () => {
        setSelected(selected.length === questions.length ? [] : questions.map((q) => q.id))
    }

    const handleDelete = async () => {
        try {
            await apiDeleteQuestion(deleteDialog.id)
            toast.push(<Notification type="success" title="Question deleted" />, { placement: 'top-center' })
            setDeleteDialog({ open: false, id: null })
            load()
        } catch {
            toast.push(<Notification type="danger" title="Delete failed" />, { placement: 'top-center' })
        }
    }

    const handleAction = async (action, id) => {
        try {
            if (action === 'submit') await apiSubmitQuestionForReview(id)
            if (action === 'approve') await apiApproveQuestion(id)
            if (action === 'clone') {
                await apiCloneQuestion(id)
                toast.push(<Notification type="success" title="Question cloned as draft" />, { placement: 'top-center' })
            }
            load()
        } catch {
            toast.push(<Notification type="danger" title="Action failed" />, { placement: 'top-center' })
        }
    }

    const handleReject = async () => {
        try {
            await apiRejectQuestion(rejectDialog.id, rejectReason)
            toast.push(<Notification type="success" title="Question rejected" />, { placement: 'top-center' })
            setRejectDialog({ open: false, id: null })
            setRejectReason('')
            load()
        } catch {
            toast.push(<Notification type="danger" title="Reject failed" />, { placement: 'top-center' })
        }
    }

    const handleBulkStatus = async (status) => {
        if (!selected.length) return
        try {
            await apiBulkUpdateQuestionStatus(selected, status)
            toast.push(<Notification type="success" title={`${selected.length} questions updated`} />, { placement: 'top-center' })
            setSelected([])
            load()
        } catch {
            toast.push(<Notification type="danger" title="Bulk update failed" />, { placement: 'top-center' })
        }
    }

    const clearFilters = () => setFilters({ subject_id: '', type: '', difficulty: '', status: '', search: '', page: 1, per_page: 25 })
    const hasFilters = filters.subject_id || filters.type || filters.difficulty || filters.status || filters.search

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <h3 className="text-lg font-semibold">Questions <span className="text-sm font-normal text-gray-400">({total})</span></h3>
                        <div className="flex gap-2">
                            <Button variant="default" icon={<TbFileImport />} onClick={() => navigate(`${ECMC_PREFIX_PATH}/qbank/import`)}>
                                Import
                            </Button>
                            <Button variant="solid" icon={<TbPlus />} onClick={() => navigate(`${ECMC_PREFIX_PATH}/qbank/questions/create`)}>
                                Add Question
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <Input
                            placeholder="Search questions..."
                            prefix={<TbSearch className="text-lg" />}
                            value={filters.search}
                            onChange={(e) => setFilter('search', e.target.value)}
                            className="w-56"
                        />
                        <Select
                            placeholder="Subject"
                            options={subjects}
                            isClearable
                            className="w-40"
                            onChange={(opt) => setFilter('subject_id', opt?.value || '')}
                        />
                        <Select
                            placeholder="Type"
                            options={TYPE_OPTIONS}
                            isClearable
                            className="w-40"
                            onChange={(opt) => setFilter('type', opt?.value || '')}
                        />
                        <Select
                            placeholder="Difficulty"
                            options={DIFFICULTY_OPTIONS}
                            isClearable
                            className="w-36"
                            onChange={(opt) => setFilter('difficulty', opt?.value || '')}
                        />
                        <Select
                            placeholder="Status"
                            options={STATUS_OPTIONS}
                            isClearable
                            className="w-36"
                            onChange={(opt) => setFilter('status', opt?.value || '')}
                        />
                        {hasFilters && (
                            <Button size="sm" icon={<TbX />} onClick={clearFilters}>Clear</Button>
                        )}
                    </div>

                    {/* Bulk Actions */}
                    {selected.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{selected.length} selected</span>
                            <div className="flex gap-2 ml-auto flex-wrap">
                                <Button size="xs" icon={<TbCircleCheck />} onClick={() => handleBulkStatus('approved')}>Approve All</Button>
                                <Button size="xs" icon={<TbSend />} onClick={() => handleBulkStatus('review')}>Submit for Review</Button>
                                <Button size="xs" icon={<TbTrash />} className="text-red-500" onClick={() => handleBulkStatus('archived')}>Archive All</Button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner size="40px" /></div>
                    ) : (
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>
                                        <Checkbox checked={selected.length === questions.length && questions.length > 0} onChange={toggleSelectAll} />
                                    </Th>
                                    <Th>Question</Th>
                                    <Th>Type</Th>
                                    <Th>Difficulty</Th>
                                    <Th>Marks</Th>
                                    <Th>Status</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {questions.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={7} className="text-center text-gray-400 py-10">No questions found</Td>
                                    </Tr>
                                ) : questions.map((q) => (
                                    <Tr key={q.id}>
                                        <Td>
                                            <Checkbox checked={selected.includes(q.id)} onChange={() => toggleSelect(q.id)} />
                                        </Td>
                                        <Td>
                                            <div className="max-w-sm">
                                                <p className="text-sm font-medium line-clamp-2">{q.question_text}</p>
                                                {q.subject?.name && <p className="text-xs text-gray-400 mt-0.5">{q.subject.name}{q.topic?.name ? ` › ${q.topic.name}` : ''}</p>}
                                            </div>
                                        </Td>
                                        <Td>
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded capitalize">
                                                {q.type?.replace(/_/g, ' ')}
                                            </span>
                                        </Td>
                                        <Td>
                                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${diffColors[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                                                {q.difficulty}
                                            </span>
                                        </Td>
                                        <Td>{q.marks}</Td>
                                        <Td>
                                            <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${statusColors[q.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {q.status}
                                            </span>
                                        </Td>
                                        <Td>
                                            <div className="flex gap-1">
                                                <Button size="xs" icon={<TbPencil />} onClick={() => navigate(`${ECMC_PREFIX_PATH}/qbank/questions/edit/${q.id}`)} />
                                                <Button size="xs" icon={<TbCopy />} onClick={() => handleAction('clone', q.id)} title="Clone" />
                                                {q.status === 'draft' && (
                                                    <Button size="xs" icon={<TbSend />} onClick={() => handleAction('submit', q.id)} title="Submit for Review" />
                                                )}
                                                {q.status === 'review' && (
                                                    <>
                                                        <Button size="xs" icon={<TbCircleCheck />} className="text-emerald-600" onClick={() => handleAction('approve', q.id)} title="Approve" />
                                                        <Button size="xs" icon={<TbCircleX />} className="text-red-500" onClick={() => setRejectDialog({ open: true, id: q.id })} title="Reject" />
                                                    </>
                                                )}
                                                <Button size="xs" variant="plain" className="text-red-500" icon={<TbTrash />} onClick={() => setDeleteDialog({ open: true, id: q.id })} />
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    )}

                    {/* Pagination */}
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
                </div>
            </AdaptiveCard>

            {/* Reject Dialog */}
            <Dialog isOpen={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null })}>
                <h5 className="mb-3 font-semibold">Reject Question</h5>
                <p className="text-sm text-gray-500 mb-3">Provide a reason for rejection:</p>
                <Input
                    textArea
                    rows={3}
                    placeholder="e.g. Missing explanation. Options A and C are too similar..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => setRejectDialog({ open: false, id: null })}>Cancel</Button>
                    <Button variant="solid" className="bg-red-500 hover:bg-red-600" onClick={handleReject}>Reject</Button>
                </div>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
                <h5 className="mb-2 font-semibold">Delete Question</h5>
                <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                    <Button onClick={() => setDeleteDialog({ open: false, id: null })}>Cancel</Button>
                    <Button variant="solid" className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>Delete</Button>
                </div>
            </Dialog>
        </Container>
    )
}

export default QuestionList

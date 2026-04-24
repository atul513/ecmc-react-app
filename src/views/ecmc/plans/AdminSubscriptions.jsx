import { useEffect, useState, useCallback } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import {
    apiAdminGetSubscriptions,
    apiAdminAssignSubscription,
    apiAdminUpdateSubscriptionStatus,
    apiAdminExtendSubscription,
    apiAdminGetPlans,
} from '@/services/PlanService'
import {
    TbSearch, TbPlus, TbRefresh, TbCalendarPlus,
    TbCircleCheck, TbBan, TbClock, TbX, TbUserPlus,
    TbPhoto, TbExternalLink,
} from 'react-icons/tb'

const { THead, TBody, Tr, Th, Td } = Table

const STATUS_COLORS = {
    active:    'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600',
    expired:   'bg-gray-100 text-gray-500',
    pending:   'bg-amber-100 text-amber-700',
}

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
    { value: 'pending', label: 'Pending' },
]

const PaymentProofDialog = ({ sub, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                <div>
                    <h3 className="font-semibold">Payment Screenshot</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {sub.user?.name || sub.user?.email || `Subscription #${sub.id}`}
                    </p>
                </div>
                <button type="button" onClick={onClose}>
                    <TbX className="text-xl text-gray-400 hover:text-gray-600" />
                </button>
            </div>

            <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900 px-4 py-3">
                        <p className="text-xs text-gray-400 mb-1">Reference ID</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100 break-all">
                            {sub.payment_reference || '—'}
                        </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-900 px-4 py-3">
                        <p className="text-xs text-gray-400 mb-1">Payment Method</p>
                        <p className="font-medium text-gray-800 dark:text-gray-100 capitalize">
                            {(sub.payment_method || '—').replaceAll('_', ' ')}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
                    <img
                        src={sub.payment_screenshot_url}
                        alt="Student payment screenshot"
                        className="w-full max-h-[70vh] object-contain rounded-xl bg-white dark:bg-gray-800"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center px-6 pb-5 gap-3">
                <Button className="min-w-28" onClick={onClose}>Close</Button>
                <a
                    href={sub.payment_screenshot_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                    <TbExternalLink size={16} />
                    Open Full Image
                </a>
            </div>
        </div>
    </div>
)

// ─── Assign Dialog ─────────────────────────────────────────────────────────────
const AssignDialog = ({ plans, onClose, onAssigned }) => {
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ user_id: '', plan_id: '', starts_at: '' })
    const [errors, setErrors] = useState({})
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

    const planOptions = plans.map((p) => ({ value: p.id, label: `${p.name} — ${p.duration_days}d` }))

    const validate = () => {
        const e = {}
        if (!form.user_id.toString().trim()) e.user_id = 'User ID required'
        if (!form.plan_id) e.plan_id = 'Plan required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSave = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            await apiAdminAssignSubscription({
                user_id:    Number(form.user_id),
                plan_id:    form.plan_id,
                starts_at:  form.starts_at || undefined,
            })
            toast.push(<Notification type="success" title="Subscription assigned" />, { placement: 'top-center' })
            onAssigned()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Failed to assign'} />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold">Assign Subscription</h3>
                    <button type="button" onClick={onClose}><TbX className="text-xl text-gray-400 hover:text-gray-600" /></button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">User ID <span className="text-red-400">*</span></label>
                        <Input
                            type="number"
                            placeholder="Enter user ID"
                            value={form.user_id}
                            onChange={(e) => set('user_id', e.target.value)}
                            invalid={Boolean(errors.user_id)}
                        />
                        {errors.user_id && <p className="text-xs text-red-500 mt-1">{errors.user_id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Plan <span className="text-red-400">*</span></label>
                        <Select
                            options={planOptions}
                            placeholder="Select plan..."
                            value={planOptions.find((o) => o.value === form.plan_id) || null}
                            onChange={(opt) => set('plan_id', opt?.value || '')}
                        />
                        {errors.plan_id && <p className="text-xs text-red-500 mt-1">{errors.plan_id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date <span className="text-gray-400 font-normal">(optional — defaults to today)</span></label>
                        <Input type="date" value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} />
                    </div>
                </div>
                <div className="flex gap-3 px-6 pb-5">
                    <Button className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button variant="solid" className="flex-1" loading={saving} onClick={handleSave} icon={<TbUserPlus />}>
                        Assign
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ─── Extend Dialog ─────────────────────────────────────────────────────────────
const ExtendDialog = ({ sub, onClose, onExtended }) => {
    const [days, setDays] = useState('30')
    const [saving, setSaving] = useState(false)

    const handleExtend = async () => {
        const d = Number(days)
        if (!d || d < 1) return
        setSaving(true)
        try {
            await apiAdminExtendSubscription(sub.id, { days: d })
            toast.push(<Notification type="success" title={`Extended by ${d} days`} />, { placement: 'top-center' })
            onExtended()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Extend failed'} />, { placement: 'top-center' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold">Extend Subscription</h3>
                    <button type="button" onClick={onClose}><TbX className="text-xl text-gray-400" /></button>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-gray-500 mb-4">
                        Extending subscription for <strong>{sub.user?.name || sub.user?.email}</strong>
                        {sub.expires_at && <> · currently expires <strong>{new Date(sub.expires_at).toLocaleDateString()}</strong></>}
                    </p>
                    <label className="block text-sm font-medium mb-1">Days to extend</label>
                    <Input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} />
                </div>
                <div className="flex gap-3 px-6 pb-5">
                    <Button className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button variant="solid" className="flex-1" loading={saving} onClick={handleExtend} icon={<TbCalendarPlus />}>
                        Extend
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminSubscriptions = () => {
    const [subs, setSubs] = useState([])
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [actionLoading, setActionLoading] = useState(null)
    const [showAssign, setShowAssign] = useState(false)
    const [extendTarget, setExtendTarget] = useState(null)
    const [proofTarget, setProofTarget] = useState(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = {}
            if (statusFilter) params.status = statusFilter
            if (search) params.search = search
            const [subsRes, plansRes] = await Promise.all([
                apiAdminGetSubscriptions(params),
                apiAdminGetPlans(),
            ])
            setSubs(subsRes?.data || [])
            setPlans(plansRes?.data || [])
        } catch {
            toast.push(<Notification type="danger" title="Failed to load data" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [search, statusFilter])

    useEffect(() => { load() }, [load])

    const updateStatus = async (sub, status) => {
        setActionLoading(`${sub.id}_${status}`)
        try {
            await apiAdminUpdateSubscriptionStatus(sub.id, { status })
            toast.push(<Notification type="success" title={`Subscription ${status}`} />, { placement: 'top-center' })
            load()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Action failed'} />, { placement: 'top-center' })
        } finally {
            setActionLoading(null)
        }
    }

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—'

    return (
        <Container>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold">Subscriptions</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Manage all user subscriptions</p>
                    </div>
                    <Button variant="solid" icon={<TbPlus />} onClick={() => setShowAssign(true)}>
                        Assign
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <Input
                        prefix={<TbSearch />}
                        placeholder="Search by user name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                    <Select
                        options={STATUS_OPTIONS}
                        defaultValue={STATUS_OPTIONS[0]}
                        className="w-44"
                        onChange={(opt) => setStatusFilter(opt?.value || '')}
                    />
                    <Button icon={<TbRefresh />} onClick={load}>Refresh</Button>
                </div>

                {/* Table */}
                <AdaptiveCard>
                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner size="32px" /></div>
                    ) : (
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>User</Th>
                                    <Th>Plan</Th>
                                    <Th>Status</Th>
                                    <Th>Payment</Th>
                                    <Th>Start</Th>
                                    <Th>Expires</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {subs.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={8} className="text-center py-10 text-gray-400">
                                            No subscriptions found
                                        </Td>
                                    </Tr>
                                ) : subs.map((sub) => (
                                    <Tr key={sub.id}>
                                        <Td className="font-mono text-sm text-gray-400">{sub.id}</Td>
                                        <Td>
                                            <div className="font-medium text-sm">{sub.user?.name || '—'}</div>
                                            <div className="text-xs text-gray-400">{sub.user?.email || `User #${sub.user_id}`}</div>
                                        </Td>
                                        <Td>
                                            <div className="font-medium text-sm">{sub.plan?.name || '—'}</div>
                                            {sub.plan?.duration_days && (
                                                <div className="text-xs text-gray-400">{sub.plan.duration_days} days</div>
                                            )}
                                        </Td>
                                        <Td>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                                                ${STATUS_COLORS[sub.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {sub.status}
                                            </span>
                                        </Td>
                                        <Td>
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500 break-all">
                                                    {sub.payment_reference || 'No reference'}
                                                </div>
                                                {sub.payment_screenshot_url ? (
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        className="text-primary px-0"
                                                        icon={<TbPhoto />}
                                                        onClick={() => setProofTarget(sub)}
                                                    >
                                                        View screenshot
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No screenshot</span>
                                                )}
                                            </div>
                                        </Td>
                                        <Td className="text-sm text-gray-500">{formatDate(sub.starts_at)}</Td>
                                        <Td className="text-sm text-gray-500">{formatDate(sub.expires_at)}</Td>
                                        <Td>
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {sub.status !== 'active' && (
                                                    <Button
                                                        size="xs"
                                                        icon={<TbCircleCheck />}
                                                        title="Activate"
                                                        loading={actionLoading === `${sub.id}_active`}
                                                        onClick={() => updateStatus(sub, 'active')}
                                                    />
                                                )}
                                                {sub.status === 'active' && (
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        className="text-red-500"
                                                        icon={<TbBan />}
                                                        title="Cancel"
                                                        loading={actionLoading === `${sub.id}_cancelled`}
                                                        onClick={() => updateStatus(sub, 'cancelled')}
                                                    />
                                                )}
                                                {sub.status === 'active' && (
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        className="text-amber-500"
                                                        icon={<TbClock />}
                                                        title="Mark Expired"
                                                        loading={actionLoading === `${sub.id}_expired`}
                                                        onClick={() => updateStatus(sub, 'expired')}
                                                    />
                                                )}
                                                <Button
                                                    size="xs"
                                                    variant="plain"
                                                    className="text-blue-500"
                                                    icon={<TbCalendarPlus />}
                                                    title="Extend"
                                                    onClick={() => setExtendTarget(sub)}
                                                />
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    )}
                </AdaptiveCard>
            </div>

            {showAssign && (
                <AssignDialog
                    plans={plans}
                    onClose={() => setShowAssign(false)}
                    onAssigned={() => { setShowAssign(false); load() }}
                />
            )}
            {extendTarget && (
                <ExtendDialog
                    sub={extendTarget}
                    onClose={() => setExtendTarget(null)}
                    onExtended={() => { setExtendTarget(null); load() }}
                />
            )}
            {proofTarget?.payment_screenshot_url && (
                <PaymentProofDialog
                    sub={proofTarget}
                    onClose={() => setProofTarget(null)}
                />
            )}
        </Container>
    )
}

export default AdminSubscriptions

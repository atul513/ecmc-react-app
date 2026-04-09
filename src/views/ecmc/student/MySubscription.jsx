import { useEffect, useState } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Table from '@/components/ui/Table'
import { apiGetMySubscription, apiGetMySubscriptions, apiCancelSubscription } from '@/services/PlanService'
import {
    TbCheck, TbCalendar, TbCalendarOff, TbShieldCheck,
    TbShieldX, TbClock, TbBan,
} from 'react-icons/tb'

const { THead, TBody, Tr, Th, Td } = Table

const STATUS_COLORS = {
    active:    'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600',
    expired:   'bg-gray-100 text-gray-500',
    pending:   'bg-amber-100 text-amber-700',
}

const STATUS_ICONS = {
    active:    <TbShieldCheck className="text-emerald-500 text-lg" />,
    cancelled: <TbShieldX className="text-red-500 text-lg" />,
    expired:   <TbClock className="text-gray-400 text-lg" />,
    pending:   <TbClock className="text-amber-500 text-lg" />,
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const daysLeft = (expiresAt) => {
    if (!expiresAt) return null
    const diff = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    return diff
}

// ─── Active Subscription Card ──────────────────────────────────────────────────
const ActiveSubscriptionCard = ({ sub }) => {
    const remaining = daysLeft(sub.expires_at)
    const plan = sub.plan || {}
    const isExpiringSoon = remaining !== null && remaining <= 7 && remaining > 0

    return (
        <AdaptiveCard className="relative overflow-hidden">
            {/* Decorative bg */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative">
                {/* Status */}
                <div className="flex items-center gap-2 mb-4">
                    {STATUS_ICONS[sub.status]}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[sub.status] || 'bg-gray-100 text-gray-500'}`}>
                        {sub.status}
                    </span>
                    {isExpiringSoon && (
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-700">
                            ⚠️ Expires soon
                        </span>
                    )}
                </div>

                {/* Plan name + price */}
                <div className="mb-4">
                    <h4 className="text-xl font-bold">{plan.name || 'Subscription'}</h4>
                    {plan.price != null && (
                        <p className="text-sm text-gray-400 mt-0.5">
                            {plan.currency === 'INR' ? '₹' : (plan.currency || '')}{Number(plan.price).toLocaleString()}
                            {plan.duration_days && ` / ${plan.duration_days} days`}
                        </p>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <TbCalendar className="text-gray-400 shrink-0" />
                        <div>
                            <p className="text-xs text-gray-400">Start date</p>
                            <p className="font-medium">{formatDate(sub.starts_at)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <TbCalendarOff className={`shrink-0 ${isExpiringSoon ? 'text-amber-500' : 'text-gray-400'}`} />
                        <div>
                            <p className="text-xs text-gray-400">Expires</p>
                            <p className={`font-medium ${isExpiringSoon ? 'text-amber-600' : ''}`}>
                                {formatDate(sub.expires_at)}
                                {remaining !== null && remaining > 0 && (
                                    <span className="text-xs text-gray-400 ml-1">({remaining}d left)</span>
                                )}
                                {remaining !== null && remaining <= 0 && (
                                    <span className="text-xs text-red-500 ml-1">(Expired)</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features */}
                {plan.features?.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Included features</p>
                        <ul className="space-y-1">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <TbCheck className="text-emerald-500 shrink-0" />{f}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </AdaptiveCard>
    )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const MySubscription = () => {
    const [current, setCurrent] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(false)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const [curRes, histRes] = await Promise.all([
                apiGetMySubscription().catch(() => null),
                apiGetMySubscriptions().catch(() => null),
            ])
            setCurrent(curRes?.data || null)
            setHistory(histRes?.data || [])
        } catch {
            toast.push(<Notification type="danger" title="Failed to load subscription" />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleCancel = async () => {
        setShowCancelConfirm(false)
        setCancelling(true)
        try {
            await apiCancelSubscription()
            toast.push(<Notification type="success" title="Subscription cancelled" />, { placement: 'top-center' })
            load()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Cancel failed'} />, { placement: 'top-center' })
        } finally {
            setCancelling(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center py-20"><Spinner size="36px" /></div>
    }

    return (
        <Container>
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                <div>
                    <h3 className="text-xl font-semibold">My Subscription</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Your current plan and subscription history</p>
                </div>

                {/* Current subscription */}
                {current ? (
                    <div className="flex flex-col gap-3">
                        <ActiveSubscriptionCard sub={current} />
                        {(current.status === 'active' || current.status === 'pending') && (
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    variant="plain"
                                    className="text-red-500 hover:text-red-600"
                                    icon={<TbBan />}
                                    loading={cancelling}
                                    onClick={() => setShowCancelConfirm(true)}
                                >
                                    Cancel Subscription
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <AdaptiveCard>
                        <div className="text-center py-10">
                            <TbShieldX className="text-5xl text-gray-300 mx-auto mb-3" />
                            <p className="font-semibold text-gray-600 dark:text-gray-300">No active subscription</p>
                            <p className="text-sm text-gray-400 mt-1">Contact your administrator to get a plan assigned.</p>
                        </div>
                    </AdaptiveCard>
                )}

                {/* History */}
                {history.length > 0 && (
                    <div>
                        <h5 className="font-semibold mb-3">Subscription History</h5>
                        <AdaptiveCard className="p-0">
                            <Table>
                                <THead>
                                    <Tr>
                                        <Th>Plan</Th>
                                        <Th>Status</Th>
                                        <Th>Start</Th>
                                        <Th>Expired</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {history.map((s) => (
                                        <Tr key={s.id}>
                                            <Td className="font-medium text-sm">{s.plan?.name || '—'}</Td>
                                            <Td>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize
                                                    ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-500'}`}>
                                                    {s.status}
                                                </span>
                                            </Td>
                                            <Td className="text-sm text-gray-500">{formatDate(s.starts_at)}</Td>
                                            <Td className="text-sm text-gray-500">{formatDate(s.expires_at)}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </AdaptiveCard>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={showCancelConfirm}
                type="danger"
                title="Cancel subscription"
                confirmButtonColor="red-600"
                onClose={() => setShowCancelConfirm(false)}
                onRequestClose={() => setShowCancelConfirm(false)}
                onCancel={() => setShowCancelConfirm(false)}
                onConfirm={handleCancel}
            >
                <p>Are you sure you want to cancel your subscription? You will lose access when the current period ends.</p>
            </ConfirmDialog>
        </Container>
    )
}

export default MySubscription

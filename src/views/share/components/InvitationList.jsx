import { useState, useEffect, useCallback } from 'react'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import InvitationStatusBadge from './InvitationStatusBadge'
import { apiListInvitations, apiResendInvite, apiCancelInvite } from '@/services/ShareService'
import {
    TbRefresh, TbSend, TbX, TbMail, TbBrandWhatsapp, TbPhone,
    TbChevronLeft, TbChevronRight, TbInbox,
} from 'react-icons/tb'

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'opened', label: 'Opened' },
    { value: 'registered', label: 'Registered' },
    { value: 'attempted', label: 'Attempted' },
    { value: 'completed', label: 'Completed' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
]

const ChannelIcons = ({ channels = [] }) => (
    <span className="flex items-center gap-1">
        {channels.includes('email') && <TbMail size={13} className="text-blue-400" title="Email" />}
        {channels.includes('whatsapp') && <TbBrandWhatsapp size={13} className="text-emerald-500" title="WhatsApp" />}
        {channels.includes('sms') && <TbPhone size={13} className="text-amber-400" title="SMS" />}
    </span>
)

const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const InvitationList = ({ contentType, contentId, refreshTrigger }) => {
    const [invitations, setInvitations] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [actionId, setActionId] = useState(null)

    const load = useCallback(() => {
        if (!contentType || !contentId) return
        setLoading(true)
        const params = { page, per_page: 10 }
        if (statusFilter) params.status = statusFilter
        apiListInvitations(contentType, contentId, params)
            .then((res) => {
                const d = res?.data
                if (d?.data) {
                    setInvitations(d.data)
                    setLastPage(d.last_page ?? 1)
                    setTotal(d.total ?? d.data.length)
                } else {
                    const arr = Array.isArray(d) ? d : []
                    setInvitations(arr)
                    setLastPage(1)
                    setTotal(arr.length)
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [contentType, contentId, page, statusFilter, refreshTrigger])

    useEffect(() => { load() }, [load])
    useEffect(() => { setPage(1) }, [statusFilter])

    const handleResend = async (id) => {
        setActionId(id)
        try {
            await apiResendInvite(id)
            toast.push(<Notification type="success" title="Invite resent" />, { placement: 'top-center' })
            load()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Failed to resend'} />, { placement: 'top-center' })
        } finally {
            setActionId(null)
        }
    }

    const handleCancel = async (id) => {
        setActionId(id)
        try {
            await apiCancelInvite(id)
            toast.push(<Notification type="success" title="Invite cancelled" />, { placement: 'top-center' })
            load()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Failed to cancel'} />, { placement: 'top-center' })
        } finally {
            setActionId(null)
        }
    }

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Sent Invitations
                    {total > 0 && <span className="ml-2 text-xs font-normal text-gray-400">({total})</span>}
                </h4>
                <div className="flex items-center gap-2">
                    <div className="w-36">
                        <Select
                            size="sm"
                            options={STATUS_OPTIONS}
                            value={STATUS_OPTIONS.find((o) => o.value === statusFilter)}
                            onChange={(opt) => setStatusFilter(opt?.value ?? '')}
                        />
                    </div>
                    <button onClick={load} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Refresh">
                        <TbRefresh size={15} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-8"><Spinner size="28px" /></div>
            ) : invitations.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <TbInbox className="mx-auto text-3xl mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No invitations found</p>
                </div>
            ) : (
                <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {invitations.map((inv) => (
                            <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                            {inv.recipient_name || '—'}
                                        </span>
                                        <ChannelIcons channels={inv.sent_via || []} />
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
                                        {inv.recipient_email} {inv.recipient_phone && `· ${inv.recipient_phone}`}
                                    </div>
                                    <div className="text-[11px] text-gray-300 dark:text-gray-600 mt-0.5">
                                        Sent {formatDate(inv.sent_at)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <InvitationStatusBadge status={inv.status} />
                                    {!['completed', 'cancelled', 'expired'].includes(inv.status) && (
                                        <>
                                            <button
                                                onClick={() => handleResend(inv.id)}
                                                disabled={actionId === inv.id}
                                                className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                                title="Resend"
                                            >
                                                <TbSend size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleCancel(inv.id)}
                                                disabled={actionId === inv.id}
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Cancel"
                                            >
                                                <TbX size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {lastPage > 1 && (
                        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/20">
                            <span className="text-xs text-gray-400">Page {page} of {lastPage}</span>
                            <div className="flex gap-1">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="p-1 rounded text-gray-400 hover:text-primary disabled:opacity-40"
                                >
                                    <TbChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={page >= lastPage}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="p-1 rounded text-gray-400 hover:text-primary disabled:opacity-40"
                                >
                                    <TbChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default InvitationList

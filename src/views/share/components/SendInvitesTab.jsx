import { useState } from 'react'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import InviteRecipientForm from './InviteRecipientForm'
import BulkRecipientInput from './BulkRecipientInput'
import InvitationList from './InvitationList'
import { apiSendInvites } from '@/services/ShareService'
import {
    TbPlus, TbSend, TbMail, TbBrandWhatsapp, TbPhone,
    TbUsers, TbListDetails, TbCheck, TbAlertCircle,
} from 'react-icons/tb'

const EMPTY_RECIPIENT = { name: '', email: '', phone: '' }

const CHANNELS = [
    { key: 'email',    label: 'Email',    icon: TbMail,          color: 'text-blue-500' },
    { key: 'whatsapp', label: 'WhatsApp', icon: TbBrandWhatsapp,  color: 'text-emerald-500' },
    { key: 'sms',      label: 'SMS',      icon: TbPhone,          color: 'text-amber-500' },
]

const SendInvitesTab = ({ contentType, contentId }) => {
    const [recipients, setRecipients] = useState([{ ...EMPTY_RECIPIENT }])
    const [channels, setChannels] = useState(['email'])
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [result, setResult] = useState(null)
    const [inputMode, setInputMode] = useState('manual') // 'manual' | 'bulk'
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const updateRecipient = (index, updated) => {
        setRecipients((prev) => prev.map((r, i) => (i === index ? updated : r)))
    }

    const removeRecipient = (index) => {
        setRecipients((prev) => prev.filter((_, i) => i !== index))
    }

    const addRecipient = () => {
        setRecipients((prev) => [...prev, { ...EMPTY_RECIPIENT }])
    }

    const handleBulkImport = (imported) => {
        setRecipients((prev) => {
            const hasEmpty = prev.length === 1 && !prev[0].name && !prev[0].email
            return hasEmpty ? imported : [...prev, ...imported]
        })
        setInputMode('manual')
    }

    const toggleChannel = (key) => {
        setChannels((prev) =>
            prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
        )
    }

    const handleSend = async () => {
        const validRecipients = recipients.filter((r) => r.name.trim() || r.email.trim())
        if (validRecipients.length === 0) {
            toast.push(<Notification type="warning" title="Add at least one recipient" />, { placement: 'top-center' })
            return
        }
        if (channels.length === 0) {
            toast.push(<Notification type="warning" title="Select at least one channel" />, { placement: 'top-center' })
            return
        }

        setSending(true)
        setResult(null)
        try {
            const res = await apiSendInvites({
                content_type: contentType,
                content_id: contentId,
                channels,
                message: message.trim(),
                recipients: validRecipients,
            })
            const d = res?.data || res
            setResult(d)
            toast.push(<Notification type="success" title={`${d.sent ?? validRecipients.length} invite${d.sent !== 1 ? 's' : ''} sent!`} />, { placement: 'top-center' })
            setRecipients([{ ...EMPTY_RECIPIENT }])
            setMessage('')
            setRefreshTrigger((v) => v + 1)
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Failed to send invites'} />, { placement: 'top-center' })
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-5">
            {/* Channel selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Send via</label>
                <div className="flex gap-2">
                    {CHANNELS.map(({ key, label, icon: Icon, color }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => toggleChannel(key)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all
                                ${channels.includes(key)
                                    ? 'border-primary bg-primary/5 text-primary dark:bg-primary/10'
                                    : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                                }`}
                        >
                            <Icon size={15} className={channels.includes(key) ? 'text-primary' : color} />
                            {label}
                            {channels.includes(key) && <TbCheck size={13} className="text-primary" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom message */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Message (optional)
                </label>
                <textarea
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={2}
                    placeholder="Please attempt this test before Friday!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>

            {/* Recipients */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <TbUsers size={15} /> Recipients
                    </label>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5 text-xs">
                        <button
                            onClick={() => setInputMode('manual')}
                            className={`px-2.5 py-1 rounded-md font-medium transition-all ${inputMode === 'manual' ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500'}`}
                        >
                            Manual
                        </button>
                        <button
                            onClick={() => setInputMode('bulk')}
                            className={`px-2.5 py-1 rounded-md font-medium transition-all ${inputMode === 'bulk' ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500'}`}
                        >
                            Bulk paste
                        </button>
                    </div>
                </div>

                {inputMode === 'bulk' ? (
                    <BulkRecipientInput onImport={handleBulkImport} />
                ) : (
                    <div className="space-y-2">
                        {/* Header labels */}
                        <div className="hidden sm:flex gap-2 text-[11px] text-gray-400 px-1">
                            <span className="flex-1 min-w-[140px]">Name</span>
                            <span className="flex-1 min-w-[160px]">Email</span>
                            <span className="flex-1 min-w-[130px]">Phone</span>
                            {recipients.length > 1 && <span className="w-7" />}
                        </div>
                        {recipients.map((r, i) => (
                            <InviteRecipientForm
                                key={i}
                                index={i}
                                recipient={r}
                                onChange={updateRecipient}
                                onRemove={removeRecipient}
                                canRemove={recipients.length > 1}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={addRecipient}
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
                        >
                            <TbPlus size={15} /> Add recipient
                        </button>
                    </div>
                )}
            </div>

            {/* Send button */}
            <Button
                variant="solid"
                icon={<TbSend />}
                onClick={handleSend}
                loading={sending}
                className="w-full"
                disabled={channels.length === 0}
            >
                Send Invites
            </Button>

            {/* Result */}
            {result && (
                <div className={`flex items-start gap-3 p-3 rounded-xl border ${result.sent > 0 ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'}`}>
                    {result.sent > 0
                        ? <TbCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        : <TbAlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    }
                    <div className="text-sm">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {result.sent ?? 0} sent
                        </span>
                        {result.skipped > 0 && <span className="text-gray-500 ml-2">{result.skipped} skipped</span>}
                        {result.errors?.length > 0 && (
                            <span className="text-red-500 ml-2">{result.errors.length} failed</span>
                        )}
                    </div>
                </div>
            )}

            {/* Sent invitations list */}
            <InvitationList
                contentType={contentType}
                contentId={contentId}
                refreshTrigger={refreshTrigger}
            />
        </div>
    )
}

export default SendInvitesTab

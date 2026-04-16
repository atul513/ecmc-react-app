import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { DatePicker } from '@/components/ui'
import {
    apiCreateShareLink, apiUpdateShareLink, apiDeactivateShareLink, apiGetShareAnalytics,
} from '@/services/ShareService'
import {
    TbCopy, TbCheck, TbBrandWhatsapp, TbLink, TbEye, TbUserPlus,
    TbPlayerPlay, TbToggleLeft, TbToggleRight, TbTrash, TbRefresh,
    TbCalendar, TbUsers,
} from 'react-icons/tb'

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            <Icon size={17} />
        </div>
        <div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{value ?? '—'}</div>
            <div className="text-xs text-gray-400">{label}</div>
        </div>
    </div>
)

const ShareLinkTab = ({ contentType, contentId, contentTitle }) => {
    const [linkData, setLinkData] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [toggling, setToggling] = useState(false)

    // Create form fields
    const [title, setTitle] = useState(contentTitle || '')
    const [message, setMessage] = useState('')
    const [requireReg, setRequireReg] = useState(true)
    const [expiresAt, setExpiresAt] = useState(null)
    const [maxReg, setMaxReg] = useState('')

    const loadAnalytics = () => {
        if (!contentType || !contentId) return
        apiGetShareAnalytics(contentType, contentId)
            .then((res) => {
                const d = res?.data || res
                setAnalytics(d)
                if (d?.share_link?.url) {
                    setLinkData(d.share_link)
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadAnalytics() }, [contentType, contentId])

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const payload = {
                content_type: contentType,
                content_id: contentId,
                title: title.trim() || contentTitle,
                message: message.trim(),
                require_registration: requireReg,
            }
            if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString()
            if (maxReg) payload.max_registrations = Number(maxReg)

            const res = await apiCreateShareLink(payload)
            const d = res?.data || res
            setLinkData(d)
            toast.push(<Notification type="success" title="Share link created!" />, { placement: 'top-center' })
            loadAnalytics()
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Failed to create link'} />, { placement: 'top-center' })
        } finally {
            setGenerating(false)
        }
    }

    const handleCopy = () => {
        const url = linkData?.url || linkData?.share_link?.url
        if (!url) return
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.push(<Notification type="success" title="Link copied!" />, { placement: 'top-center' })
        })
    }

    const handleWhatsApp = () => {
        const waUrl = linkData?.whatsapp_url
        if (waUrl) window.open(waUrl, '_blank')
    }

    const handleToggleActive = async () => {
        const shareCode = linkData?.share_code
        if (!shareCode) return
        setToggling(true)
        try {
            await apiUpdateShareLink(shareCode, { is_active: !linkData?.is_active })
            setLinkData((prev) => ({ ...prev, is_active: !prev?.is_active }))
            toast.push(<Notification type="success" title={linkData?.is_active ? 'Link deactivated' : 'Link activated'} />, { placement: 'top-center' })
        } catch {
            toast.push(<Notification type="danger" title="Failed to update link" />, { placement: 'top-center' })
        } finally {
            setToggling(false)
        }
    }

    const handleDelete = async () => {
        const shareCode = linkData?.share_code
        if (!shareCode) return
        try {
            await apiDeactivateShareLink(shareCode)
            setLinkData(null)
            setAnalytics(null)
            toast.push(<Notification type="success" title="Link removed" />, { placement: 'top-center' })
        } catch {
            toast.push(<Notification type="danger" title="Failed to remove link" />, { placement: 'top-center' })
        }
    }

    if (loading) {
        return <div className="flex justify-center py-12"><Spinner size="32px" /></div>
    }

    const shareUrl = linkData?.url

    return (
        <div className="space-y-5">
            {shareUrl ? (
                <>
                    {/* Link display */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <TbLink size={15} className="text-primary" />
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Share Link</span>
                            <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${linkData?.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                {linkData?.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="text-xs font-mono flex-1"
                            />
                            <Button
                                size="sm"
                                icon={copied ? <TbCheck className="text-emerald-500" /> : <TbCopy />}
                                onClick={handleCopy}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0"
                                icon={<TbBrandWhatsapp />}
                                onClick={handleWhatsApp}
                            >
                                Share on WhatsApp
                            </Button>
                            <Button
                                size="sm"
                                icon={toggling ? <Spinner size="14px" /> : (linkData?.is_active ? <TbToggleRight /> : <TbToggleLeft />)}
                                onClick={handleToggleActive}
                                disabled={toggling}
                            >
                                {linkData?.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <button
                                onClick={handleDelete}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-auto"
                                title="Remove link"
                            >
                                <TbTrash size={16} />
                            </button>
                            <button
                                onClick={loadAnalytics}
                                className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                title="Refresh stats"
                            >
                                <TbRefresh size={16} />
                            </button>
                        </div>

                        {linkData?.expires_at && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <TbCalendar size={13} />
                                Expires: {new Date(linkData.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        )}
                        {linkData?.max_registrations && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <TbUsers size={13} />
                                Max registrations: {linkData.max_registrations}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    {analytics?.share_link && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Link Stats</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <StatCard icon={TbEye} label="Clicks" value={analytics.share_link.click_count} color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300" />
                                <StatCard icon={TbUserPlus} label="Registrations" value={analytics.share_link.registration_count} color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300" />
                                <StatCard icon={TbPlayerPlay} label="Attempts" value={analytics.share_link.attempt_count} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300" />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Generate form */
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Generate a shareable link that anyone can use to register and attempt this content.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Physics Mock Test — SSC Batch"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message (optional)</label>
                        <textarea
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={2}
                            placeholder="Test your knowledge and track your progress!"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires At (optional)</label>
                            <DatePicker
                                value={expiresAt}
                                onChange={(val) => setExpiresAt(val)}
                                placeholder="No expiry"
                                inputFormat="DD/MM/YYYY"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Registrations (optional)</label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="Unlimited"
                                value={maxReg}
                                onChange={(e) => setMaxReg(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setRequireReg(!requireReg)}
                            className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${requireReg ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${requireReg ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                        <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Registration</div>
                            <div className="text-[11px] text-gray-400">Users must sign up before attempting</div>
                        </div>
                    </div>

                    <Button
                        variant="solid"
                        icon={<TbLink />}
                        onClick={handleGenerate}
                        loading={generating}
                        className="w-full"
                    >
                        Generate Share Link
                    </Button>
                </div>
            )}
        </div>
    )
}

export default ShareLinkTab

import { useEffect, useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import ShareFunnel from './ShareFunnel'
import ChannelBreakdown from './ChannelBreakdown'
import { apiGetShareAnalytics } from '@/services/ShareService'
import {
    TbLink, TbEye, TbUserPlus, TbPlayerPlay, TbRefresh,
    TbChartBar, TbMail,
} from 'react-icons/tb'

const MiniStat = ({ label, value }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value ?? '—'}</span>
    </div>
)

const AnalyticsTab = ({ contentType, contentId }) => {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const load = () => {
        if (!contentType || !contentId) return
        setLoading(true)
        setError(false)
        apiGetShareAnalytics(contentType, contentId)
            .then((res) => {
                setAnalytics(res?.data || res)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [contentType, contentId])

    if (loading) return <div className="flex justify-center py-12"><Spinner size="32px" /></div>

    if (error || !analytics) {
        return (
            <div className="text-center py-12 text-gray-400">
                <TbChartBar className="mx-auto text-4xl mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">No analytics available yet</p>
                <button onClick={load} className="text-primary text-sm hover:underline mt-2 flex items-center gap-1 mx-auto">
                    <TbRefresh size={14} /> Retry
                </button>
            </div>
        )
    }

    const { share_link, invitations, funnel } = analytics

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Analytics Overview</h4>
                <button onClick={load} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Refresh">
                    <TbRefresh size={15} />
                </button>
            </div>

            {/* Share link stats */}
            {share_link && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <TbLink size={15} className="text-primary" />
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Share Link</h5>
                        <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${share_link.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-200 text-gray-500'}`}>
                            {share_link.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                            <TbEye size={18} className="text-blue-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{share_link.click_count ?? 0}</div>
                            <div className="text-xs text-gray-400">Clicks</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                            <TbUserPlus size={18} className="text-purple-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{share_link.registration_count ?? 0}</div>
                            <div className="text-xs text-gray-400">Registered</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-center">
                            <TbPlayerPlay size={18} className="text-emerald-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-gray-800 dark:text-gray-100">{share_link.attempt_count ?? 0}</div>
                            <div className="text-xs text-gray-400">Attempted</div>
                        </div>
                    </div>
                    {share_link.expires_at && (
                        <p className="text-xs text-gray-400">
                            Expires: {new Date(share_link.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    )}
                </div>
            )}

            {/* Invitation funnel */}
            {funnel && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <TbChartBar size={15} className="text-primary" />
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invitation Funnel</h5>
                    </div>
                    <ShareFunnel funnel={funnel} />
                </div>
            )}

            {/* Invitations by status */}
            {invitations?.by_status && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <TbMail size={15} className="text-primary" />
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Invitations by Status
                            {invitations.total != null && <span className="ml-2 font-normal text-gray-400 normal-case">({invitations.total} total)</span>}
                        </h5>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                        {Object.entries(invitations.by_status).map(([status, count]) => (
                            <MiniStat key={status} label={status.charAt(0).toUpperCase() + status.slice(1)} value={count} />
                        ))}
                    </div>
                </div>
            )}

            {/* Channel breakdown */}
            {invitations?.channels && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Channel Breakdown</h5>
                    </div>
                    <ChannelBreakdown channels={invitations.channels} />
                </div>
            )}

            {!share_link && !funnel && !invitations && (
                <div className="text-center py-8 text-gray-400">
                    <TbChartBar className="mx-auto text-4xl mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">Share this content to see analytics</p>
                </div>
            )}
        </div>
    )
}

export default AnalyticsTab

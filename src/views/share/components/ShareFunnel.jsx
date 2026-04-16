const STEPS = [
    { key: 'invited',    label: 'Invited',    color: 'bg-blue-500' },
    { key: 'opened',     label: 'Opened',     color: 'bg-amber-500' },
    { key: 'registered', label: 'Registered', color: 'bg-purple-500' },
    { key: 'attempted',  label: 'Attempted',  color: 'bg-orange-500' },
    { key: 'completed',  label: 'Completed',  color: 'bg-emerald-500' },
]

const ShareFunnel = ({ funnel = {} }) => {
    const max = funnel.invited || 1

    return (
        <div className="space-y-2.5">
            {STEPS.map((step, idx) => {
                const count = funnel[step.key] ?? 0
                const pct = Math.round((count / max) * 100)
                const prevCount = idx > 0 ? (funnel[STEPS[idx - 1].key] ?? 0) : null
                const dropPct = prevCount != null && prevCount > 0
                    ? Math.round(((prevCount - count) / prevCount) * 100)
                    : null

                return (
                    <div key={step.key}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{step.label}</span>
                            <div className="flex items-center gap-2">
                                {dropPct != null && dropPct > 0 && (
                                    <span className="text-[11px] text-red-400">−{dropPct}%</span>
                                )}
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{count}</span>
                            </div>
                        </div>
                        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <div
                                className={`h-full ${step.color} rounded-lg flex items-center justify-end pr-2 transition-all duration-500`}
                                style={{ width: `${Math.max(pct, 2)}%` }}
                            >
                                {pct > 10 && (
                                    <span className="text-[10px] font-bold text-white">{pct}%</span>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ShareFunnel

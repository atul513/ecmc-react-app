const STATUS_CONFIG = {
    pending:    { label: 'Pending',     cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
    sent:       { label: 'Sent',        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    opened:     { label: 'Opened',      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    registered: { label: 'Registered',  cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    attempted:  { label: 'Attempted',   cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    completed:  { label: 'Completed',   cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    expired:    { label: 'Expired',     cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    cancelled:  { label: 'Cancelled',   cls: 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 line-through' },
}

const InvitationStatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${cfg.cls}`}>
            {cfg.label}
        </span>
    )
}

export default InvitationStatusBadge

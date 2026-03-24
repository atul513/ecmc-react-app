import Tag from '@/components/ui/Tag'

const statusConfig = {
    draft: { label: 'Draft', className: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200' },
    published: { label: 'Published', className: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' },
    scheduled: { label: 'Scheduled', className: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' },
    archived: { label: 'Archived', className: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300' },
}

const BlogStatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.draft
    return (
        <Tag className={`font-semibold ${config.className}`}>
            {config.label}
        </Tag>
    )
}

export default BlogStatusBadge

import { useEffect, useState, useCallback } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Spinner from '@/components/ui/Spinner'
import {
    apiGetExamSections, apiGetExamSectionTypes,
    apiLinkContentToSection, apiUnlinkContentFromSection,
} from '@/services/ExamSectionService'
import {
    TbSitemap, TbSearch, TbPlus, TbX, TbLoader,
} from 'react-icons/tb'

const FALLBACK_TYPES = ['exam_group', 'exam', 'variant', 'subject', 'chapter', 'topic']

const TYPE_COLORS = {
    exam_group: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    exam: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    variant: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    subject: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    chapter: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    topic: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
}

const TypeBadge = ({ type }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}>
        {(type || '').replace('_', ' ')}
    </span>
)

// Convert slug to readable text: "andhra-pradesh-board-c10-physics" → "Andhra Pradesh Board C10 Physics"
const slugToReadable = (slug) => {
    if (!slug) return ''
    return slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

// Inline section detail — no extra API calls
const SectionDetail = ({ section }) => {
    const hasCode = !!section.code
    const hasSlug = !!section.slug
    const parentName = section.parent?.name

    if (!hasCode && !hasSlug && !parentName) return null

    return (
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {hasCode && (
                <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 tracking-wide">
                    {section.code}
                </span>
            )}
            {hasSlug && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[300px]">
                    {slugToReadable(section.slug)}
                </span>
            )}
            {!hasSlug && parentName && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {parentName}
                </span>
            )}
        </div>
    )
}

/**
 * LinkedSections — reusable panel for linking/unlinking exam sections to a quiz or practice set.
 *
 * Props:
 *   contentId       — ID of the quiz or practice set
 *   linkableType    — "quiz" | "practice_set"
 *   initialSections — array of already-linked section objects from the API response (optional)
 */
const LinkedSections = ({ contentId, linkableType, initialSections = [] }) => {
    const [linked, setLinked] = useState(initialSections)
    const [types, setTypes] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('')
    const [searching, setSearching] = useState(false)
    const [linkingId, setLinkingId] = useState(null)
    const [unlinkingId, setUnlinkingId] = useState(null)

    useEffect(() => {
        apiGetExamSectionTypes()
            .then((res) => {
                const t = res?.data || []
                setTypes(Array.isArray(t) ? t : FALLBACK_TYPES)
            })
            .catch(() => setTypes(FALLBACK_TYPES))
    }, [])

    const handleSearch = useCallback(() => {
        if (!search.trim() && !filterType) return
        setSearching(true)
        const params = {}
        if (search.trim()) params.search = search.trim()
        if (filterType) params.type = filterType
        params.is_active = 1
        apiGetExamSections(params)
            .then((res) => setSearchResults(res?.data?.data || res?.data || []))
            .catch(() => setSearchResults([]))
            .finally(() => setSearching(false))
    }, [search, filterType])

    useEffect(() => {
        if (!search.trim() && !filterType) {
            setSearchResults([])
            return
        }
        const timer = setTimeout(handleSearch, 400)
        return () => clearTimeout(timer)
    }, [search, filterType, handleSearch])

    const handleLink = async (section) => {
        if (linked.some((s) => s.id === section.id)) {
            toast.push(<Notification type="warning" title="Already linked" />, { placement: 'top-center' })
            return
        }
        setLinkingId(section.id)
        try {
            await apiLinkContentToSection(section.id, linkableType, contentId)
            setLinked((prev) => [...prev, section])
            toast.push(<Notification type="success" title={`Linked to "${section.name}"`} />, { placement: 'top-center' })
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Link failed'} />, { placement: 'top-center' })
        } finally {
            setLinkingId(null)
        }
    }

    const handleUnlink = async (section) => {
        setUnlinkingId(section.id)
        try {
            await apiUnlinkContentFromSection(section.id, linkableType, contentId)
            setLinked((prev) => prev.filter((s) => s.id !== section.id))
            toast.push(<Notification type="success" title={`Unlinked from "${section.name}"`} />, { placement: 'top-center' })
        } catch (err) {
            toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Unlink failed'} />, { placement: 'top-center' })
        } finally {
            setUnlinkingId(null)
        }
    }

    const typeOptions = [
        { value: '', label: 'All Types' },
        ...types.map((t) => ({ value: t, label: t.replace('_', ' ') })),
    ]

    const linkedIds = new Set(linked.map((s) => s.id))

    return (
        <AdaptiveCard>
            <div className="flex items-center gap-2 mb-5">
                <TbSitemap className="text-xl text-primary" />
                <h5 className="font-semibold">Linked Exam Sections</h5>
                <span className="text-xs text-gray-400 ml-auto">
                    Connect this {linkableType === 'quiz' ? 'quiz/exam' : 'practice set'} to categories like Exam Group, Subject, Chapter, Topic
                </span>
            </div>

            {/* Currently linked */}
            {linked.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700 mb-5">
                    {linked.map((section) => (
                        <div key={section.id} className="flex items-center justify-between py-2.5 gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <TypeBadge type={section.type} />
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                        {section.name}
                                    </div>
                                    <SectionDetail section={section} />
                                </div>
                            </div>
                            <Button
                                size="xs"
                                variant="plain"
                                icon={unlinkingId === section.id ? <TbLoader className="animate-spin" /> : <TbX />}
                                disabled={!!unlinkingId}
                                onClick={() => handleUnlink(section)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-400 italic mb-5">No exam sections linked yet.</p>
            )}

            {/* Search & link */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <p className="text-xs font-medium text-gray-500 mb-3">Search and link a section:</p>
                <div className="flex gap-2 flex-wrap">
                    <div className="flex-1 min-w-[180px]">
                        <Input
                            prefix={<TbSearch />}
                            placeholder="Search by name…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <Select
                            options={typeOptions}
                            value={typeOptions.find((o) => o.value === filterType)}
                            onChange={(opt) => setFilterType(opt?.value || '')}
                            placeholder="Filter type"
                            size="sm"
                        />
                    </div>
                </div>

                {searching && (
                    <div className="flex justify-center py-4">
                        <Spinner size="24px" />
                    </div>
                )}

                {!searching && searchResults.length > 0 && (
                    <div className="mt-3 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                        {searchResults.map((section) => {
                            const alreadyLinked = linkedIds.has(section.id)
                            return (
                                <div
                                    key={section.id}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 border-b border-gray-50 dark:border-gray-700 last:border-0 gap-3"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <TypeBadge type={section.type} />
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                                {section.name}
                                            </div>
                                            <SectionDetail section={section} />
                                        </div>
                                    </div>
                                    <Button
                                        size="xs"
                                        variant={alreadyLinked ? 'default' : 'solid'}
                                        icon={linkingId === section.id ? <TbLoader className="animate-spin" /> : <TbPlus />}
                                        disabled={alreadyLinked || !!linkingId}
                                        onClick={() => handleLink(section)}
                                        className="shrink-0"
                                    >
                                        {alreadyLinked ? 'Linked' : 'Link'}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}

                {!searching && (search.trim() || filterType) && searchResults.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No sections found. Try a different search.</p>
                )}
            </div>
        </AdaptiveCard>
    )
}

export default LinkedSections

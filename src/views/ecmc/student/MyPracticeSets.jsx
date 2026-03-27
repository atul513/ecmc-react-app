import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { apiGetMyPracticeSets } from '@/services/PracticeSetService'
import { ECMC_PREFIX_PATH } from '@/constants/route.constant'
import { TbSearch, TbPlayerPlay, TbLock, TbStar, TbBook } from 'react-icons/tb'

const stripHtml = (html) => (html || '').replace(/<[^>]+>/g, '').trim()

const MyPracticeSets = () => {
    const navigate = useNavigate()
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await apiGetMyPracticeSets()
                setSets(res?.data || [])
            } catch {
                toast.push(
                    <Notification type="danger" title="Failed to load practice sets" />,
                    { placement: 'top-center' },
                )
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = sets.filter((s) =>
        s.title?.toLowerCase().includes(search.toLowerCase()),
    )

    return (
        <Container>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold">Practice Sets</h3>
                        <p className="text-sm text-gray-500">
                            Practice questions with instant feedback
                        </p>
                    </div>
                    <Input
                        prefix={<TbSearch />}
                        placeholder="Search practice sets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-56"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Spinner size="40px" />
                    </div>
                ) : filtered.length === 0 ? (
                    <AdaptiveCard>
                        <div className="text-center py-12 text-gray-400">
                            No practice sets available
                        </div>
                    </AdaptiveCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((set) => (
                            <AdaptiveCard key={set.id} className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="font-semibold">{set.title}</div>
                                        {set.description && (
                                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                {stripHtml(set.description)}
                                            </div>
                                        )}
                                    </div>
                                    {set.access_type === 'paid' && (
                                        <span className="text-xs px-2 py-1 rounded-full font-medium shrink-0 bg-purple-100 text-purple-700">
                                            Paid
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                    {set.subject?.name && (
                                        <span className="flex items-center gap-1">
                                            <TbBook className="text-base" />
                                            {set.subject.name}
                                        </span>
                                    )}
                                    {(set.questions_count ?? set.total_questions) != null && (
                                        <span>
                                            {set.questions_count ?? set.total_questions} questions
                                        </span>
                                    )}
                                    {set.allow_reward_points && (
                                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                                            <TbStar className="text-base" />
                                            Reward Points
                                        </span>
                                    )}
                                    {set.access_type === 'paid' && set.price && (
                                        <span className="flex items-center gap-1 text-purple-600 font-medium">
                                            <TbLock className="text-base" />
                                            ₹{set.price}
                                        </span>
                                    )}
                                </div>

                                {set.category?.name && (
                                    <div className="text-xs text-gray-400">
                                        {set.category.name}
                                    </div>
                                )}

                                <div className="mt-auto pt-2">
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        icon={<TbPlayerPlay />}
                                        className="w-full"
                                        disabled={set.access_type === 'paid' && !set.has_access}
                                        onClick={() =>
                                            navigate(
                                                `${ECMC_PREFIX_PATH}/student/practice/${set.id}`,
                                            )
                                        }
                                    >
                                        {set.access_type === 'paid' && !set.has_access
                                            ? 'Purchase to Access'
                                            : 'Start Practice'}
                                    </Button>
                                </div>
                            </AdaptiveCard>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    )
}

export default MyPracticeSets

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingFooter from '@/views/others/Landing/components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { apiResolveShareLink } from '@/services/ShareService'
import { useAuth } from '@/auth'
import {
    TbClipboardList,
    TbBook,
    TbCode,
    TbPlayerPlay,
    TbUserPlus,
    TbCalendar,
    TbClock,
    TbAlertCircle,
    TbMoodSad,
} from 'react-icons/tb'
import { APP_NAME } from '@/constants/app.constant'

const CONTENT_ICONS = {
    quiz: TbClipboardList,
    exam: TbClipboardList,
    practice_set: TbBook,
    coding_test: TbCode,
}

const ShareLandingPage = () => {
    const { shareCode } = useParams()
    const [searchParams] = useSearchParams()
    const src = searchParams.get('src') || ''
    const navigate = useNavigate()
    const { authenticated } = useAuth()

    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () =>
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [expired, setExpired] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (!shareCode) return
        apiResolveShareLink(shareCode, src)
            .then((res) => {
                const d = res?.data || res
                if (d?.valid === false) {
                    setExpired(true)
                    setErrorMsg(
                        d.message ||
                            'This link has expired or is no longer active.',
                    )
                } else {
                    setData(d)
                }
            })
            .catch((err) => {
                const status = err?.response?.status
                if (status === 410 || status === 404) {
                    setExpired(true)
                    setErrorMsg(
                        err?.response?.data?.message ||
                            'This link has expired or is no longer active.',
                    )
                } else {
                    setErrorMsg('Something went wrong. Please try again.')
                }
            })
            .finally(() => setLoading(false))
    }, [shareCode, src])

    const handleStart = () => {
        if (authenticated) {
            // If already logged in, redirect to the content
            const type = data?.content?.type?.toLowerCase()
            if (type === 'quiz' || type === 'exam')
                navigate(`/quiz/${data.content.id}`)
            else if (type === 'practice_set')
                navigate(`/practice-sets/${data.content.id}`)
            else if (type === 'coding_test')
                navigate(`/coding-tests/${data.content.id}`)
            else navigate('/home')
        } else {
            navigate(`/sign-up?ref=share&code=${shareCode}`)
        }
    }

    const ContentIcon = data?.content?.type
        ? CONTENT_ICONS[data.content.type.toLowerCase()] || TbClipboardList
        : TbClipboardList

    return (
        <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <div className="max-w-xl mx-auto px-4 pt-32 pb-20 flex flex-col items-center">
                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20">
                        <Spinner size="40px" />
                        <p className="text-gray-400 text-sm">Loading…</p>
                    </div>
                ) : expired || errorMsg ? (
                    /* Expired state */
                    <div className="w-full text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
                            <TbMoodSad className="text-4xl text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                            Link Expired
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                            {errorMsg}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link to="/landing">
                                <Button>Go to Home</Button>
                            </Link>
                            <Link to="/explore">
                                <Button variant="solid">Browse Content</Button>
                            </Link>
                        </div>
                    </div>
                ) : data ? (
                    /* Valid link */
                    <div className="w-full">
                        {/* Share message card */}
                        {(data.share?.title || data.share?.message) && (
                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4 mb-5 text-center">
                                {data.share?.title && (
                                    <p className="font-semibold text-primary text-sm mb-1">
                                        {data.share.title}
                                    </p>
                                )}
                                {data.share?.message && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {data.share.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Content card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-700">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                                    <ContentIcon className="text-3xl text-blue-500" />
                                </div>
                                {data.content?.type && (
                                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-0.5 rounded-full mb-3">
                                        {data.content.type}
                                    </span>
                                )}
                                <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">
                                    {data.content?.title}
                                </h1>
                                {data.content?.description && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                                        {data.content.description
                                            .replace(/<[^>]+>/g, '')
                                            .trim()}
                                    </p>
                                )}
                            </div>

                            {/* Meta */}
                            {(data.content?.total_questions ||
                                data.content?.total_duration_min) && (
                                <div className="flex items-center justify-center gap-5 px-6 py-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                                    {data.content?.total_questions != null && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <TbClipboardList size={15} />
                                            {data.content.total_questions}{' '}
                                            questions
                                        </div>
                                    )}
                                    {data.content?.total_duration_min !=
                                        null && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                            <TbClock size={15} />
                                            {
                                                data.content.total_duration_min
                                            }{' '}
                                            min
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CTA */}
                            <div className="p-6 text-center space-y-3">
                                {authenticated ? (
                                    <Button
                                        variant="solid"
                                        size="lg"
                                        icon={<TbPlayerPlay />}
                                        onClick={handleStart}
                                        className="w-full"
                                    >
                                        Start Now
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="solid"
                                            size="lg"
                                            icon={<TbUserPlus />}
                                            onClick={handleStart}
                                            className="w-full"
                                        >
                                            {data.require_registration
                                                ? 'Register to Start'
                                                : 'Sign In to Start'}
                                        </Button>
                                        <p className="text-xs text-gray-400">
                                            Already have an account?{' '}
                                            <Link
                                                to={`/sign-in?redirect=/share/${shareCode}`}
                                                className="text-primary hover:underline"
                                            >
                                                Sign in
                                            </Link>
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-6">
                            Powered by {APP_NAME} Learning & Online
                            Exam/Practice Platform
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-400">
                        <TbAlertCircle className="mx-auto text-4xl mb-3 text-gray-300" />
                        <p>Something went wrong. Please try again.</p>
                    </div>
                )}
            </div>

            <LandingFooter mode={mode} />
        </main>
    )
}

export default ShareLandingPage

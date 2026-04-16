import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingFooter from '@/views/others/Landing/components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { apiResolveInvite, apiRegisterViaInvite } from '@/services/ShareService'
import { useToken } from '@/store/authStore'
import {
    TbClipboardList, TbBook, TbCode, TbPlayerPlay,
    TbMoodSad, TbAlertCircle, TbUser, TbMail,
    TbPhone, TbLock, TbArrowRight, TbCheck,
} from 'react-icons/tb'

const CONTENT_ICONS = {
    quiz: TbClipboardList,
    exam: TbClipboardList,
    practice_set: TbBook,
    coding_test: TbCode,
}

const Field = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <Input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            prefix={Icon ? <Icon size={15} className="text-gray-400" /> : null}
            className={error ? 'border-red-400' : ''}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
)

const InviteLandingPage = () => {
    const { inviteCode } = useParams()
    const [searchParams] = useSearchParams()
    const src = searchParams.get('src') || ''
    const navigate = useNavigate()

    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [expired, setExpired] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // Registration form
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [registered, setRegistered] = useState(false)

    const { setToken } = useToken?.() || {}

    useEffect(() => {
        if (!inviteCode) return
        apiResolveInvite(inviteCode, src)
            .then((res) => {
                const d = res?.data || res
                if (d?.valid === false) {
                    setExpired(true)
                    setErrorMsg(d.message || 'This invitation has expired or is no longer active.')
                } else {
                    setData(d)
                    // Pre-fill form from invite data
                    setForm((f) => ({
                        ...f,
                        name: d.invite?.recipient_name || '',
                        email: d.invite?.recipient_email || '',
                    }))
                }
            })
            .catch((err) => {
                const status = err?.response?.status
                if (status === 410 || status === 404) {
                    setExpired(true)
                    setErrorMsg(err?.response?.data?.message || 'This invitation has expired or is no longer active.')
                } else {
                    setErrorMsg('Something went wrong. Please try again.')
                }
            })
            .finally(() => setLoading(false))
    }, [inviteCode, src])

    const validate = () => {
        const errs = {}
        if (!form.name.trim()) errs.name = 'Name is required'
        if (!form.email.trim()) errs.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email'
        if (!form.password) errs.password = 'Password is required'
        else if (form.password.length < 8) errs.password = 'Minimum 8 characters'
        if (form.password !== form.password_confirmation) errs.password_confirmation = 'Passwords do not match'
        return errs
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setErrors({})
        setSubmitting(true)
        try {
            const res = await apiRegisterViaInvite(inviteCode, form)
            const d = res?.data || res

            // Save token
            if (d?.token) {
                localStorage.setItem('token', d.token)
                if (typeof setToken === 'function') setToken(d.token)
            }

            setRegistered(true)
            toast.push(<Notification type="success" title="Registration successful! Redirecting…" />, { placement: 'top-center' })

            // Redirect to content
            setTimeout(() => {
                const redirect = d?.redirect_to
                if (redirect) {
                    const type = redirect.type?.toLowerCase()
                    if (type === 'quiz' || type === 'exam') navigate(`/quiz/${redirect.slug ?? redirect.id}`)
                    else if (type === 'practice_set') navigate(`/practice-sets/${redirect.slug ?? redirect.id}`)
                    else if (type === 'coding_test') navigate(`/coding-tests/${redirect.slug ?? redirect.id}`)
                    else navigate('/home')
                } else {
                    navigate('/home')
                }
            }, 1200)
        } catch (err) {
            const serverErrors = err?.response?.data?.errors
            if (serverErrors) {
                setErrors(serverErrors)
            } else {
                toast.push(<Notification type="danger" title={err?.response?.data?.message || 'Registration failed'} />, { placement: 'top-center' })
            }
        } finally {
            setSubmitting(false)
        }
    }

    const ContentIcon = data?.content?.type
        ? (CONTENT_ICONS[data.content.type.toLowerCase()] || TbClipboardList)
        : TbClipboardList

    return (
        <main className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <div className="max-w-lg mx-auto px-4 pt-32 pb-20">
                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20">
                        <Spinner size="40px" />
                        <p className="text-gray-400 text-sm">Loading your invitation…</p>
                    </div>
                ) : expired || (errorMsg && !data) ? (
                    /* Expired */
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
                            <TbMoodSad className="text-4xl text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Invitation Expired</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">{errorMsg}</p>
                        <Link to="/landing">
                            <Button>Go to Home</Button>
                        </Link>
                    </div>
                ) : data ? (
                    <div className="space-y-5">
                        {/* Personal greeting */}
                        <div className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/10 border border-primary/10 rounded-2xl p-5">
                            {data.invite?.recipient_name && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                    Hi <span className="font-semibold text-gray-800 dark:text-gray-100">{data.invite.recipient_name}</span>,
                                </p>
                            )}
                            {data.invite?.invited_by && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    <span className="font-semibold text-primary">{data.invite.invited_by}</span> has invited you to attempt:
                                </p>
                            )}
                            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-50 mb-2">
                                {data.content?.title}
                            </h1>
                            {data.invite?.message && (
                                <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl px-4 py-3 mt-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{data.invite.message}"</p>
                                </div>
                            )}
                        </div>

                        {/* Content info */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                <ContentIcon className="text-2xl text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    {data.content?.type && (
                                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                            {data.content.type}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{data.content?.title}</h3>
                                {data.content?.description && (
                                    <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                                        {data.content.description.replace(/<[^>]+>/g, '').trim()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Already registered → login */}
                        {data.already_registered ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center">
                                <TbCheck className="mx-auto text-3xl text-emerald-500 mb-2" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">You already have an account</p>
                                <p className="text-xs text-gray-400 mb-4">Sign in to attempt this content.</p>
                                <Link to={`/sign-in?redirect=/invite/${inviteCode}`}>
                                    <Button variant="solid" icon={<TbArrowRight />} className="w-full">
                                        Login to Start
                                    </Button>
                                </Link>
                            </div>
                        ) : registered ? (
                            /* Success */
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center">
                                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
                                    <TbCheck className="text-white text-2xl" />
                                </div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">Registration Successful!</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting you to the content…</p>
                                <Spinner size="20px" className="mx-auto mt-3" />
                            </div>
                        ) : (
                            /* Registration form */
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">
                                    Create your account to start
                                </h2>
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <Field
                                        label="Full Name"
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        placeholder="Rahul Sharma"
                                        icon={TbUser}
                                        error={errors.name}
                                    />
                                    <Field
                                        label="Email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                        placeholder="rahul@example.com"
                                        icon={TbMail}
                                        error={errors.email}
                                    />
                                    <Field
                                        label="Phone (optional)"
                                        value={form.phone}
                                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                        placeholder="919876543210"
                                        icon={TbPhone}
                                        error={errors.phone}
                                    />
                                    <Field
                                        label="Password"
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                        placeholder="Min. 8 characters"
                                        icon={TbLock}
                                        error={errors.password}
                                    />
                                    <Field
                                        label="Confirm Password"
                                        type="password"
                                        value={form.password_confirmation}
                                        onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                                        placeholder="Repeat password"
                                        icon={TbLock}
                                        error={errors.password_confirmation}
                                    />
                                    <Button
                                        type="submit"
                                        variant="solid"
                                        loading={submitting}
                                        icon={<TbPlayerPlay />}
                                        className="w-full"
                                    >
                                        Register &amp; Start
                                    </Button>
                                    <p className="text-xs text-center text-gray-400">
                                        Already have an account?{' '}
                                        <Link to={`/sign-in?redirect=/invite/${inviteCode}`} className="text-primary hover:underline">
                                            Sign in
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        )}
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

export default InviteLandingPage

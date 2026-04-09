import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import LandingContainer from '@/views/others/Landing/components/LandingContainer'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { useAuth } from '@/auth'
import { apiGetPublicPlans, apiSubscribeToPlan } from '@/services/PlanService'
import {
    TbCheck, TbCalendar, TbLoader, TbAlertCircle,
    TbShieldCheck, TbClock,
} from 'react-icons/tb'

// ─── Plan CTA button ──────────────────────────────────────────────────────────

const PlanCTA = ({ plan, authenticated, isHighlighted, onSubscribe, subscribing }) => {
    const navigate = useNavigate()
    const sub = plan.user_subscription

    const btnBase = `w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2`
    const primaryBtn = isHighlighted
        ? `${btnBase} bg-white text-primary hover:bg-white/90 shadow-lg`
        : `${btnBase} bg-primary text-white hover:bg-primary/90`
    const disabledBtn = isHighlighted
        ? `${btnBase} bg-white/30 text-white cursor-default`
        : `${btnBase} bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-default`

    if (!authenticated) {
        const signInTarget = Number(plan.price) === 0
            ? '/sign-in'
            : `/sign-in?redirectUrl=${encodeURIComponent(`/payment/${plan.id}`)}`
        return (
            <button type="button" onClick={() => navigate(signInTarget)} className={primaryBtn}>
                Get Started
            </button>
        )
    }

    if (sub?.status === 'active') {
        return (
            <div className={`${disabledBtn}`}>
                <TbShieldCheck size={16} />
                Active
                {sub.days_remaining != null && (
                    <span className="text-xs opacity-70">· {sub.days_remaining}d left</span>
                )}
            </div>
        )
    }

    if (sub?.status === 'pending') {
        return (
            <div className={disabledBtn}>
                <TbClock size={16} />
                Pending Approval
            </div>
        )
    }

    return (
        <button
            type="button"
            disabled={subscribing}
            onClick={() => onSubscribe(plan)}
            className={primaryBtn}
        >
            {subscribing ? <TbLoader className="animate-spin" size={16} /> : null}
            {Number(plan.price) === 0 ? 'Activate Free Plan' : 'Get Started'}
        </button>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PublicPricing = () => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)
    const navigate = useNavigate()
    const { authenticated } = useAuth()

    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [subscribingId, setSubscribingId] = useState(null)
    const [successPlanId, setSuccessPlanId] = useState(null)

    const year = new Date().getFullYear()

    useEffect(() => {
        apiGetPublicPlans()
            .then((res) => setPlans(res?.data || []))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    const handleSubscribe = async (plan) => {
        if (Number(plan.price) === 0) {
            // Free plan — subscribe immediately
            setSubscribingId(plan.id)
            try {
                const res = await apiSubscribeToPlan(plan.id)
                const subData = res?.data
                setPlans((prev) => prev.map((p) =>
                    p.id === plan.id ? { ...p, user_subscription: subData } : p
                ))
                setSuccessPlanId(plan.id)
                setTimeout(() => setSuccessPlanId(null), 4000)
            } catch (err) {
                alert(err?.response?.data?.message || 'Subscription failed. Please try again.')
            } finally {
                setSubscribingId(null)
            }
        } else {
            // Paid plan — redirect to payment page with plan data in state
            navigate(`/payment/${plan.id}`, { state: { plan } })
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col bg-white dark:bg-gray-900">
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            <main className="flex-1 pt-28 pb-20">
                <LandingContainer>
                    {/* Hero text */}
                    <div className="text-center mb-14">
                        <h1 className="text-4xl md:text-5xl font-extrabold heading-text mb-4">
                            Simple, transparent pricing
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                            Choose the plan that fits your needs. All plans include full access to the platform features.
                        </p>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                            <TbLoader className="text-4xl animate-spin" />
                            <span className="text-sm">Loading plans…</span>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                            <TbAlertCircle className="text-4xl text-red-400" />
                            <span>Unable to load plans. Please try again later.</span>
                        </div>
                    )}

                    {/* No plans */}
                    {!loading && !error && plans.length === 0 && (
                        <div className="text-center py-24 text-gray-400">
                            No plans available at the moment. Please check back soon.
                        </div>
                    )}

                    {/* Plan cards */}
                    {!loading && !error && plans.length > 0 && (
                        <div className={`grid gap-8 mx-auto
                            ${plans.length === 1 ? 'max-w-sm' : ''}
                            ${plans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' : ''}
                            ${plans.length >= 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}`}>
                            {plans.map((plan, idx) => {
                                const isHighlighted = plans.length === 3 && idx === 1
                                const isSuccess = successPlanId === plan.id

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative rounded-3xl flex flex-col transition-shadow
                                            ${isHighlighted
                                                ? 'bg-primary text-white shadow-2xl scale-105 ring-4 ring-primary/30'
                                                : 'bg-white dark:bg-gray-800 shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700'
                                            }`}
                                    >
                                        {isHighlighted && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full shadow">
                                                    Most Popular
                                                </span>
                                            </div>
                                        )}

                                        {/* Success flash */}
                                        {isSuccess && (
                                            <div className="absolute inset-0 rounded-3xl flex items-center justify-center bg-emerald-500/95 z-10 pointer-events-none">
                                                <div className="flex flex-col items-center gap-2 text-white">
                                                    <TbShieldCheck className="text-5xl" />
                                                    <p className="font-bold text-lg">Subscribed!</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-8 flex flex-col flex-1">
                                            {/* Plan name */}
                                            <div className="mb-6">
                                                <h3 className={`text-xl font-bold mb-1 ${isHighlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                    {plan.name}
                                                </h3>
                                                {plan.description && (
                                                    <p className={`text-sm ${isHighlighted ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {plan.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="mb-2">
                                                <div className="flex items-baseline gap-1">
                                                    <span className={`text-sm font-medium ${isHighlighted ? 'text-white/70' : 'text-gray-400'}`}>
                                                        {plan.currency === 'INR' ? '₹' : (plan.currency || '')}
                                                    </span>
                                                    <span className={`text-5xl font-extrabold ${isHighlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                                        {Number(plan.price) === 0 ? 'Free' : Number(plan.price).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-1.5 mt-1 text-sm ${isHighlighted ? 'text-white/70' : 'text-gray-400'}`}>
                                                    <TbCalendar className="text-base" />
                                                    Valid for {plan.duration_days} days
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className={`my-6 border-t ${isHighlighted ? 'border-white/20' : 'border-gray-100 dark:border-gray-700'}`} />

                                            {/* Features */}
                                            <ul className="space-y-3 flex-1 mb-8">
                                                {(plan.features || []).map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0
                                                            ${isHighlighted ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                                                            <TbCheck className={`text-xs ${isHighlighted ? 'text-white' : 'text-emerald-600'}`} />
                                                        </span>
                                                        <span className={`text-sm ${isHighlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}`}>
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ))}
                                                {(!plan.features || plan.features.length === 0) && (
                                                    <li className={`text-sm italic ${isHighlighted ? 'text-white/50' : 'text-gray-400'}`}>
                                                        Contact us for details
                                                    </li>
                                                )}
                                            </ul>

                                            {/* CTA */}
                                            <PlanCTA
                                                plan={plan}
                                                authenticated={authenticated}
                                                isHighlighted={isHighlighted}
                                                onSubscribe={handleSubscribe}
                                                subscribing={subscribingId === plan.id}
                                            />

                                            {/* Pending notice */}
                                            {plan.user_subscription?.status === 'pending' && (
                                                <p className={`text-xs text-center mt-2 ${isHighlighted ? 'text-white/60' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    Payment under review. We'll notify you once activated.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Footer note */}
                    {!loading && !error && plans.length > 0 && (
                        <p className="text-center text-sm text-gray-400 mt-10">
                            Need a custom plan?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/contact')}
                                className="text-primary font-medium hover:underline"
                            >
                                Contact us
                            </button>
                        </p>
                    )}
                </LandingContainer>
            </main>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 py-6">
                <LandingContainer>
                    <p className="text-center text-sm text-gray-500">
                        © {year} ECMC. All rights reserved.
                    </p>
                </LandingContainer>
            </div>

        </div>
    )
}

export default PublicPricing

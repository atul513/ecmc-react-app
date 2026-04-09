import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router'
import { apiGetPublicPlan, apiSubscribeToPlan } from '@/services/PlanService'
import {
    TbCheck, TbCalendar, TbArrowLeft, TbLoader,
    TbCreditCard, TbShieldCheck, TbAlertCircle,
    TbBuildingBank, TbDeviceMobile, TbCash, TbDots,
    TbCircleCheckFilled,
} from 'react-icons/tb'

const PAYMENT_METHODS = [
    { value: 'upi',           label: 'UPI',           icon: TbDeviceMobile },
    { value: 'bank_transfer', label: 'Bank Transfer',  icon: TbBuildingBank },
    { value: 'card',          label: 'Card',           icon: TbCreditCard },
    { value: 'cash',          label: 'Cash',           icon: TbCash },
    { value: 'other',         label: 'Other',          icon: TbDots },
]

const PaymentPage = () => {
    const { planId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    // Plan may arrive via navigation state (from pricing page) or fetched fresh
    const [plan, setPlan] = useState(location.state?.plan || null)
    const [loadingPlan, setLoadingPlan] = useState(!plan)
    const [planError, setPlanError] = useState(false)

    const [method, setMethod] = useState('upi')
    const [reference, setReference] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [fieldError, setFieldError] = useState('')
    const [serverError, setServerError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!plan) {
            apiGetPublicPlan(planId)
                .then((res) => setPlan(res?.data || null))
                .catch(() => setPlanError(true))
                .finally(() => setLoadingPlan(false))
        }
    }, [planId]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!reference.trim()) {
            setFieldError('Transaction / Reference ID is required.')
            return
        }
        setFieldError('')
        setServerError('')
        setSubmitting(true)
        try {
            await apiSubscribeToPlan(planId, {
                payment_method: method,
                payment_reference: reference.trim(),
            })
            setSuccess(true)
        } catch (err) {
            setServerError(err?.response?.data?.message || 'Submission failed. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Loading state ────────────────────────────────────────────────────────
    if (loadingPlan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <TbLoader className="text-4xl text-primary animate-spin" />
            </div>
        )
    }

    if (planError || !plan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
                <TbAlertCircle className="text-5xl text-red-400" />
                <p className="font-medium">Plan not found or unavailable.</p>
                <button
                    onClick={() => navigate('/pricing')}
                    className="text-sm text-primary hover:underline"
                >
                    Back to pricing
                </button>
            </div>
        )
    }

    // ── Success state ────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
                    <TbCircleCheckFilled className="text-6xl text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Request Submitted!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Your subscription request for <strong>{plan.name}</strong> has been submitted.
                        Our team will verify your payment and activate your plan shortly.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/ecmc/student/my-subscription')}
                            className="w-full py-3 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                        >
                            View My Subscription
                        </button>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="w-full py-3 rounded-2xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Back to Pricing
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const price = Number(plan.price)
    const currency = plan.currency === 'INR' ? '₹' : (plan.currency || '₹')

    // ── Payment form ─────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <button
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-8 transition-colors"
                >
                    <TbArrowLeft size={16} />
                    Back to pricing
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* ── Left: Plan summary ──────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-7 sticky top-8">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                {plan.name}
                            </h2>
                            {plan.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                                    {plan.description}
                                </p>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-sm text-gray-400">{currency}</span>
                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                                    {price.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
                                <TbCalendar size={14} />
                                Valid for {plan.duration_days} days
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 my-5" />

                            {/* Features */}
                            {(plan.features || []).length > 0 && (
                                <ul className="space-y-2.5">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                                <TbCheck className="text-xs text-emerald-600" />
                                            </span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Secure badge */}
                            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-400">
                                <TbShieldCheck className="text-emerald-500 text-base shrink-0" />
                                Manual payment verification by our team
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Payment form ─────────────────────────────── */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-7">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                Complete Payment
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
                                Make a payment of <strong>{currency}{price.toLocaleString()}</strong> to our account,
                                then enter the transaction details below to submit your request.
                            </p>

                            {/* Payment instructions */}
                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6">
                                <p className="text-sm font-semibold text-primary mb-2">Payment Instructions</p>
                                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                                    <li>Transfer <strong>{currency}{price.toLocaleString()}</strong> to our UPI / bank account</li>
                                    <li>Note your UTR / transaction reference number</li>
                                    <li>Fill in the form below and submit</li>
                                    <li>We will activate your plan within 24 hours after verification</li>
                                </ul>
                            </div>

                            {serverError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                                    <TbAlertCircle className="shrink-0 mt-0.5" />
                                    {serverError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Payment method */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Payment Method
                                    </label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                        {PAYMENT_METHODS.map((m) => {
                                            const Icon = m.icon
                                            return (
                                                <button
                                                    key={m.value}
                                                    type="button"
                                                    onClick={() => setMethod(m.value)}
                                                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 text-xs font-semibold transition-all
                                                        ${method === m.value
                                                            ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                                                            : 'border-gray-200 dark:border-gray-600 text-gray-500 hover:border-primary/40 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <Icon size={18} />
                                                    {m.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Transaction reference */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Transaction / Reference ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={reference}
                                        onChange={(e) => { setReference(e.target.value); setFieldError('') }}
                                        placeholder="e.g. TXN123456789 or UTR number"
                                        className={`w-full border rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary transition-colors
                                            ${fieldError
                                                ? 'border-red-400 dark:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    />
                                    {fieldError && (
                                        <p className="text-xs text-red-500 mt-1">{fieldError}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                        Enter the UTR or transaction ID from your payment app
                                    </p>
                                </div>

                                {/* Order summary */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                        <span>Plan</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{plan.name}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                        <span>Duration</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{plan.duration_days} days</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                                        <span>Total</span>
                                        <span>{currency}{price.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                                >
                                    {submitting
                                        ? <><TbLoader className="animate-spin" size={18} /> Submitting…</>
                                        : <><TbCreditCard size={18} /> Submit Payment Request</>
                                    }
                                </button>

                                <p className="text-center text-xs text-gray-400">
                                    By submitting, you agree to our{' '}
                                    <button type="button" onClick={() => navigate('/terms')} className="text-primary hover:underline">terms of service</button>
                                    {' '}and{' '}
                                    <button type="button" onClick={() => navigate('/refund-policy')} className="text-primary hover:underline">refund policy</button>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaymentPage

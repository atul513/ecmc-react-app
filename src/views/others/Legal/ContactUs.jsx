import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ReCAPTCHA from 'react-google-recaptcha'
import LegalPageLayout from './LegalPageLayout'
import { apiSubmitContact } from '@/services/ContactService'
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi'
import { TbCheck, TbSend } from 'react-icons/tb'
import { APP_NAME } from '@/constants/app.constant'

const schema = z.object({
    name:    z.string().min(2, 'Name must be at least 2 characters').max(100),
    email:   z.string().email('Please enter a valid email'),
    subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

const inputClass =
    'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-colors'
const errorClass = 'text-xs text-red-500 mt-1'

const ContactUs = () => {
    const recaptchaRef = useRef(null)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [serverError, setServerError] = useState('')
    const [captchaError, setCaptchaError] = useState('')

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: zodResolver(schema) })

    const onSubmit = async (values) => {
        setServerError('')
        setCaptchaError('')

        // Get reCAPTCHA token (if site key is configured)
        let recaptchaToken = 'no-recaptcha'
        if (SITE_KEY && recaptchaRef.current) {
            recaptchaToken = recaptchaRef.current.getValue()
            if (!recaptchaToken) {
                setCaptchaError('Please complete the CAPTCHA verification.')
                return
            }
        }

        setSubmitting(true)
        try {
            await apiSubmitContact({ ...values, recaptcha_token: recaptchaToken })
            setSuccess(true)
            reset()
            recaptchaRef.current?.reset()
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                Object.values(err?.response?.data?.errors || {}).flat().join(' ') ||
                'Something went wrong. Please try again.'
            setServerError(msg)
            recaptchaRef.current?.reset()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <LegalPageLayout title="Contact Us" description={`Get in touch with the ${APP_NAME} team for support, sales enquiries or feedback.`} canonical="/contact">
            <p>
                Have a question, issue, or feedback? Our team is here to help. Reach
                out through any of the channels below.
            </p>

            {/* Contact info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose mt-4">
                <div className="flex flex-col items-center text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <HiOutlineMail size={22} />
                    </div>
                    <h3 className="font-semibold heading-text">Email</h3>
                    <a href="mailto:support@ecmc.com" className="text-primary hover:underline text-sm">
                        support@ecmc.com
                    </a>
                    <p className="text-xs text-gray-500">Response within 24 hours</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <HiOutlinePhone size={22} />
                    </div>
                    <h3 className="font-semibold heading-text">Phone</h3>
                    <a href="tel:+1800000000" className="text-primary hover:underline text-sm">
                        +1 (800) 000-0000
                    </a>
                    <p className="text-xs text-gray-500">Mon–Fri, 9am–5pm</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <HiOutlineLocationMarker size={22} />
                    </div>
                    <h3 className="font-semibold heading-text">Office</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        123 School Lane, Suite 100<br />New York, NY 10001
                    </p>
                </div>
            </div>

            {/* Contact Form */}
            <section className="mt-8 not-prose">
                <h2 className="text-xl font-semibold heading-text mb-4">Send Us a Message</h2>

                {success ? (
                    <div className="flex flex-col items-center gap-4 py-12 text-center border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                            <TbCheck className="text-green-600 dark:text-green-400 text-3xl" />
                        </div>
                        <div>
                            <p className="font-semibold text-green-700 dark:text-green-400 text-lg">Message sent!</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Thank you for contacting us. We'll get back to you within 24 hours.
                            </p>
                        </div>
                        <button
                            onClick={() => setSuccess(false)}
                            className="text-sm text-primary underline"
                        >
                            Send another message
                        </button>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        {serverError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3">
                                {serverError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium heading-text mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('name')}
                                    type="text"
                                    placeholder="Your full name"
                                    className={`${inputClass} ${errors.name ? 'border-red-400 ring-red-200' : ''}`}
                                />
                                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium heading-text mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`${inputClass} ${errors.email ? 'border-red-400 ring-red-200' : ''}`}
                                />
                                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium heading-text mb-1">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('subject')}
                                type="text"
                                placeholder="How can we help?"
                                className={`${inputClass} ${errors.subject ? 'border-red-400 ring-red-200' : ''}`}
                            />
                            {errors.subject && <p className={errorClass}>{errors.subject.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium heading-text mb-1">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                {...register('message')}
                                rows={5}
                                placeholder="Describe your issue or question..."
                                className={`${inputClass} resize-none ${errors.message ? 'border-red-400 ring-red-200' : ''}`}
                            />
                            {errors.message && <p className={errorClass}>{errors.message.message}</p>}
                        </div>

                        {/* reCAPTCHA — only rendered if site key is set */}
                        {SITE_KEY && (
                            <div>
                                <ReCAPTCHA ref={recaptchaRef} sitekey={SITE_KEY} />
                                {captchaError && <p className={errorClass}>{captchaError}</p>}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Sending…
                                </>
                            ) : (
                                <><TbSend size={16} /> Send Message</>
                            )}
                        </button>
                    </form>
                )}
            </section>
        </LegalPageLayout>
    )
}

export default ContactUs

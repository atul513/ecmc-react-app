import { useState } from 'react'
import LegalPageLayout from './LegalPageLayout'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { APP_NAME } from '@/constants/app.constant'

const faqs = [
    {
        category: 'Getting Started',
        items: [
            {
                q: 'How do I create an account?',
                a: 'Accounts are created by your school administrator. Contact your admin to get your login credentials.',
            },
            {
                q: `What roles are available on ${APP_NAME}?`,
                a: `${APP_NAME} supports five roles: Super Admin, School Admin, Teacher, Student, and Parent. Each role has a tailored dashboard and permissions.`,
            },
            {
                q: `Can I use ${APP_NAME} on my phone?`,
                a: `Yes. ${APP_NAME} is fully responsive and works on desktop, tablet, and mobile browsers.`,
            },
        ],
    },
    {
        category: 'Account & Security',
        items: [
            {
                q: 'How do I reset my password?',
                a: 'Click "Forgot Password" on the sign-in page and follow the instructions sent to your registered email.',
            },
            {
                q: 'Is my data secure?',
                a: 'Yes. We use industry-standard encryption, secure session cookies, and role-based access control to protect your data.',
            },
            {
                q: 'Can I have multiple roles?',
                a: 'A single user account is assigned one role. If you need multiple roles, contact your school administrator.',
            },
        ],
    },
    {
        category: 'For Schools & Admins',
        items: [
            {
                q: 'How do I add students and teachers?',
                a: 'Log in as School Admin, navigate to the User Management section, and use the "Add User" form to create accounts.',
            },
            {
                q: 'Can I manage multiple schools?',
                a: 'Multi-school management is available to Super Admins. Contact us to enable this feature for your account.',
            },
            {
                q: 'How do I export reports?',
                a: 'Navigate to the Reports section in the admin panel. Reports can be exported in PDF or CSV format.',
            },
        ],
    },
    {
        category: 'Billing & Subscriptions',
        items: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept major credit/debit cards and bank transfers. Contact billing@ecmc.com for invoicing options.',
            },
            {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes. You can cancel anytime from your admin settings. Refer to our Refund Policy for details on pro-rata refunds.',
            },
        ],
    },
]

const FAQItem = ({ q, a }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                className="w-full flex items-center justify-between px-4 py-3 text-left font-medium heading-text hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setOpen(!open)}
            >
                <span>{q}</span>
                {open ? <HiChevronUp className="shrink-0 ml-2" /> : <HiChevronDown className="shrink-0 ml-2" />}
            </button>
            {open && (
                <div className="px-4 pb-4 pt-2 text-gray-600 dark:text-gray-400 text-sm">
                    {a}
                </div>
            )}
        </div>
    )
}

const FAQ = () => {
    return (
        <LegalPageLayout title="FAQ — Frequently Asked Questions" description={`Find answers to the most common questions about ${APP_NAME} exams, practice sets, subscriptions and accounts.`} canonical="/faq">
            <p>
                Find answers to the most common questions about {APP_NAME}. Can't find what
                you're looking for?{' '}
                <a href="/contact" className="text-primary hover:underline">
                    Contact us
                </a>
                .
            </p>

            <div className="not-prose space-y-8 mt-6">
                {faqs.map((section) => (
                    <div key={section.category}>
                        <h2 className="text-lg font-semibold heading-text mb-3">
                            {section.category}
                        </h2>
                        <div className="space-y-2">
                            {section.items.map((item) => (
                                <FAQItem key={item.q} q={item.q} a={item.a} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </LegalPageLayout>
    )
}

export default FAQ

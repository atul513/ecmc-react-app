import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { Link } from 'react-router'
import {
    TbBrandFacebook,
    TbBrandTwitter,
    TbBrandInstagram,
    TbBrandLinkedin,
    TbBrandYoutube,
} from 'react-icons/tb'
import { APP_NAME } from '@/constants/app.constant'

const footerLinks = [
    {
        heading: 'Platform',
        links: [
            { label: 'Free Quizzes', to: '/sign-up' },
            { label: 'Practice Sets', to: '/sign-up' },
            { label: 'Mock Tests', to: '/sign-up' },
            { label: 'Question Bank', to: '/sign-up' },
        ],
    },
    {
        heading: 'Legal',
        links: [
            { label: 'Terms & Conditions', to: '/terms' },
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Cookie Policy', to: '/cookie-policy' },
            { label: 'Refund Policy', to: '/refund-policy' },
        ],
    },
    {
        heading: 'Support',
        links: [
            { label: 'Contact Us', to: '/contact' },
            { label: 'FAQ / Help Center', to: '/faq' },
            { label: 'About Us', to: '/about' },
        ],
    },
]

const socialLinks = [
    { icon: TbBrandFacebook, href: '#', label: 'Facebook' },
    { icon: TbBrandTwitter, href: '#', label: 'Twitter' },
    { icon: TbBrandInstagram, href: '#', label: 'Instagram' },
    { icon: TbBrandLinkedin, href: '#', label: 'LinkedIn' },
    { icon: TbBrandYoutube, href: '#', label: 'YouTube' },
]

const LandingFooter = ({ mode }) => {
    const year = new Date().getFullYear()

    return (
        <footer className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
                    {/* Brand */}
                    <div className="md:col-span-4 flex flex-col gap-4">
                        <a href="/landing">
                            {mode === MODE_LIGHT && (
                                <img
                                    src="/img/logo/logo-light-full.png"
                                    width={120}
                                    height={40}
                                    alt="logo"
                                />
                            )}
                            {mode === MODE_DARK && (
                                <img
                                    src="/img/logo/logo-dark-full.png"
                                    width={120}
                                    height={40}
                                    alt="logo"
                                />
                            )}
                        </a>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                            The smart platform for online exams, quizzes, and
                            practice sets. Built for students, teachers, and
                            institutions.
                        </p>
                        {/* Social media */}
                        <div className="flex items-center gap-2 mt-2">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white transition-all"
                                >
                                    <s.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {footerLinks.map((col) => (
                        <div
                            key={col.heading}
                            className="md:col-span-2 flex flex-col gap-3"
                        >
                            <h4 className="text-sm font-semibold heading-text">
                                {col.heading}
                            </h4>
                            <ul className="flex flex-col gap-2.5">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter / App download placeholder */}
                    <div className="md:col-span-2 flex flex-col gap-3">
                        <h4 className="text-sm font-semibold heading-text">
                            Get the App
                        </h4>
                        <p className="text-xs text-gray-400">Coming soon on</p>
                        <div className="flex flex-col gap-2">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Google Play Store
                            </div>
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Apple App Store
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-gray-400">
                        Copyright &copy; {year} <b>{APP_NAME}</b>. All rights
                        reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <Link
                            to="/terms"
                            className="hover:text-primary transition-colors"
                        >
                            Terms
                        </Link>
                        <Link
                            to="/privacy"
                            className="hover:text-primary transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            to="/contact"
                            className="hover:text-primary transition-colors"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default LandingFooter

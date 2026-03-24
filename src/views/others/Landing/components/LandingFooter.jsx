import Container from './LandingContainer'
import Button from '@/components/ui/Button'
import AuroraBackground from './AuroraBackground'
import { motion } from 'framer-motion'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { useNavigate, Link } from 'react-router'

const footerLinks = [
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

const LandingFooter = ({ mode }) => {
    const year = new Date().getFullYear()

    const navigate = useNavigate()

    const handlePreview = () => {
        navigate('/dashboards/ecommerce')
    }

    return (
        <div id="footer" className="relative z-20">
            <Container className="relative">
                <div className="py-10 md:py-40">
                    <AuroraBackground
                        className="rounded-3xl"
                        auroraClassName="rounded-3xl"
                    >
                        <motion.div
                            initial={{ opacity: 0.0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.3,
                                duration: 0.3,
                                ease: 'easeInOut',
                            }}
                            className="relative flex flex-col gap-4 items-center justify-center py-20 px-8 text-center"
                        >
                            <h2 className="text-5xl">Ready to Get Started?</h2>
                            <p className="mt-4 max-w-[400px] mx-auto">
                                Build modern, scalable applications effortlessly
                                with Ecme. Take your project to the next level
                                today!
                            </p>
                            <div className="mt-6">
                                <Button variant="solid" onClick={handlePreview}>
                                    Get Started Now
                                </Button>
                            </div>
                        </motion.div>
                    </AuroraBackground>
                </div>
                <div className="py-10 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between gap-10 px-4">
                        {/* Brand */}
                        <div className="flex flex-col gap-3 max-w-xs">
                            <a href="/">
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Modern school management platform for admins, teachers, students & parents.
                            </p>
                        </div>

                        {/* Link columns */}
                        <div className="flex flex-wrap gap-10">
                            {footerLinks.map((col) => (
                                <div key={col.heading} className="flex flex-col gap-3">
                                    <h4 className="text-sm font-semibold heading-text">
                                        {col.heading}
                                    </h4>
                                    <ul className="flex flex-col gap-2">
                                        {col.links.map((link) => (
                                            <li key={link.to}>
                                                <Link
                                                    to={link.to}
                                                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                                >
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 px-4">
                        <p className="text-sm text-gray-400 text-center">
                            Copyright © {year} ECMC. All rights reserved.
                        </p>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default LandingFooter

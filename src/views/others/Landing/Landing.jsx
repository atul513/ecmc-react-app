import NavigationBar from './components/NavigationBar'
import LandingFooter from './components/LandingFooter'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import { useNavigate } from 'react-router'
import { useAuth } from '@/auth'
import {
    TbPlayerPlay, TbArrowRight, TbCheck, TbStar,
    TbBrain, TbDeviceAnalytics, TbShieldCheck, TbClock,
    TbDeviceMobile, TbBook, TbTrophy, TbUsers,
    TbQuote,
} from 'react-icons/tb'

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
    {
        icon: TbBrain,
        title: 'Smart Quiz Engine',
        desc: 'MCQ, multi-select, true/false, fill-in-the-blank, match columns — all question types with instant grading.',
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
        icon: TbDeviceAnalytics,
        title: 'Detailed Reports',
        desc: 'Question-by-question analysis, difficulty breakdown, subject-wise scores and explanation for every answer.',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
        icon: TbBook,
        title: 'Practice Sets',
        desc: 'Self-paced practice with instant feedback, explanations, and reward points for every correct answer.',
        color: 'text-violet-600',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
        icon: TbShieldCheck,
        title: 'Anti-Cheating',
        desc: 'Copy/paste disabled, timer auto-submit, shuffled questions & options for secure online assessments.',
        color: 'text-red-600',
        bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
        icon: TbClock,
        title: 'Timed Assessments',
        desc: 'Set fixed or auto duration, schedules with grace periods, and multiple attempt limits per quiz.',
        color: 'text-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
        icon: TbDeviceMobile,
        title: 'Mobile Optimized',
        desc: 'Fully responsive quiz taking experience on any device — phone, tablet, laptop or desktop.',
        color: 'text-cyan-600',
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
    {
        icon: TbTrophy,
        title: 'Leaderboard & Ranking',
        desc: 'Competitive rankings, reward points, and achievement badges to keep students motivated.',
        color: 'text-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
        icon: TbUsers,
        title: 'Multi-Role Platform',
        desc: 'Separate dashboards for admins, teachers, students and parents — each with relevant features.',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
]

const testimonials = [
    {
        name: 'Dr. Priya Sharma',
        role: 'HOD, Department of Computer Science',
        text: 'This platform has transformed how we conduct assessments. The detailed analytics help us identify weak areas instantly.',
        avatar: null,
    },
    {
        name: 'Rahul Verma',
        role: 'NEET Aspirant, Class 12',
        text: 'The practice sets with instant feedback and explanations are incredible. My scores improved by 40% in just 2 months.',
        avatar: null,
    },
    {
        name: 'Prof. Anita Desai',
        role: 'Principal, DAV Public School',
        text: 'We switched from paper-based exams to this platform. Saves time, reduces errors, and students love the instant results.',
        avatar: null,
    },
]

const pricingPlans = [
    {
        name: 'Free',
        price: '0',
        period: 'forever',
        desc: 'Get started with basic quizzes',
        features: [
            'Access to free quizzes & practice sets',
            'Instant result after submission',
            'Basic performance report',
            'Mobile responsive interface',
            'Up to 3 attempts per quiz',
        ],
        cta: 'Start Free',
        variant: 'default',
        popular: false,
    },
    {
        name: 'Pro',
        price: '299',
        period: '/month',
        desc: 'For serious learners',
        features: [
            'Everything in Free',
            'Unlimited quiz attempts',
            'Detailed question-by-question reports',
            'Subject & difficulty analytics',
            'Practice sets with reward points',
            'Download PDF reports',
            'Ad-free experience',
        ],
        cta: 'Get Pro',
        variant: 'solid',
        popular: true,
    },
    {
        name: 'Institute',
        price: '1,999',
        period: '/month',
        desc: 'For schools & coaching centers',
        features: [
            'Everything in Pro',
            'Bulk question import (Excel)',
            'Create unlimited quizzes & exams',
            'Section-based exam support (NEET/JEE)',
            'Student management dashboard',
            'Custom branding',
            'Priority support',
        ],
        cta: 'Contact Sales',
        variant: 'default',
        popular: false,
    },
]

const stats = [
    { value: '10K+', label: 'Students' },
    { value: '500+', label: 'Quizzes' },
    { value: '50K+', label: 'Attempts' },
    { value: '98%', label: 'Uptime' },
]

// ─── Component ───────────────────────────────────────────────────────────────

const Landing = () => {
    const navigate = useNavigate()
    const { authenticated } = useAuth()
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT
    const toggleMode = () => setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    return (
        <main className="w-full text-base">
            <NavigationBar toggleMode={toggleMode} mode={mode} />

            {/* ── Hero ── */}
            <section className="relative overflow-hidden px-4 pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium rounded-full px-4 py-1.5 mb-6">
                        <TbStar className="text-base" />
                        Trusted by 10,000+ students
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold heading-text leading-tight mb-6">
                        The Smart Platform for
                        <span className="text-primary"> Online Exams</span> &
                        <span className="text-primary"> Practice</span>
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Create quizzes, conduct exams, practice with instant feedback, and track
                        performance — all in one powerful platform built for students and educators.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {authenticated ? (
                            <button
                                onClick={() => navigate('/ecmc/student/dashboard')}
                                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-base"
                            >
                                Go to Dashboard <TbArrowRight />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/sign-up')}
                                    className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-base"
                                >
                                    Start Free <TbArrowRight />
                                </button>
                                <button
                                    onClick={() => navigate('/sign-in')}
                                    className="inline-flex items-center gap-2 border-2 border-gray-300 dark:border-gray-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all heading-text"
                                >
                                    <TbPlayerPlay /> Sign In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Stats strip ── */}
            <section className="px-4 py-8 bg-gray-50 dark:bg-gray-800/50">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center">
                            <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="px-4 py-20 md:py-28 max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-extrabold heading-text mb-4">
                        Everything You Need to Excel
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        A complete assessment platform with powerful features for students, teachers, and institutions.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <f.icon className={`text-2xl ${f.color}`} />
                            </div>
                            <h3 className="font-bold heading-text mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="px-4 py-20 bg-gray-50 dark:bg-gray-800/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-extrabold heading-text mb-4">
                            How It Works
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">Get started in 3 simple steps</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '1', title: 'Sign Up Free', desc: 'Create your account in seconds. No credit card required.' },
                            { step: '2', title: 'Take Quizzes', desc: 'Browse available quizzes, practice sets, and exams. Start attempting.' },
                            { step: '3', title: 'Track Progress', desc: 'Get instant results, detailed reports, and improve with every attempt.' },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-primary text-white text-xl font-extrabold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                                    {item.step}
                                </div>
                                <h3 className="font-bold heading-text text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section id="pricing" className="px-4 py-20 md:py-28 max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-extrabold heading-text mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        Start free. Upgrade when you need more features.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl p-6 border-2 transition-all ${
                                plan.popular
                                    ? 'border-primary shadow-xl shadow-primary/10 bg-white dark:bg-gray-800 scale-[1.02]'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50 hover:shadow-lg'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                                    Most Popular
                                </div>
                            )}
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold heading-text">{plan.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">{plan.desc}</p>
                                <div className="mt-4">
                                    <span className="text-4xl font-extrabold heading-text">{plan.price === '0' ? 'Free' : `₹${plan.price}`}</span>
                                    {plan.price !== '0' && (
                                        <span className="text-sm text-gray-400">{plan.period}</span>
                                    )}
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <TbCheck className="text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate(plan.name === 'Institute' ? '/contact' : '/sign-up')}
                                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                                    plan.popular
                                        ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25'
                                        : 'bg-gray-100 dark:bg-gray-700 heading-text hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="px-4 py-20 bg-gray-50 dark:bg-gray-800/30">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-extrabold heading-text mb-4">
                            What Our Users Say
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Trusted by educators and students across the country
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div
                                key={t.name}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <TbQuote className="text-3xl text-primary/30 mb-3" />
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                                    "{t.text}"
                                </p>
                                <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                                        {t.name.split(' ').map((w) => w[0]).join('').substring(0, 2)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm heading-text">{t.name}</div>
                                        <div className="text-xs text-gray-400">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            {!authenticated && (
                <section className="px-4 py-20 md:py-28">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-3xl px-8 py-16 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2215%22%20r%3D%221%22%20fill%3D%22rgba(255%2C255%2C255%2C0.1)%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />
                        <div className="relative">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                                Ready to Ace Your Next Exam?
                            </h2>
                            <p className="text-white/80 max-w-lg mx-auto mb-8">
                                Join thousands of students already practicing and improving their scores. Start with free quizzes today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => navigate('/sign-up')}
                                    className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-lg text-base"
                                >
                                    Create Free Account <TbArrowRight />
                                </button>
                                <button
                                    onClick={() => navigate('/sign-in')}
                                    className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Footer ── */}
            <LandingFooter mode={mode} />
        </main>
    )
}

export default Landing

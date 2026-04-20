import { Link } from 'react-router'
import { useAuth } from '@/auth'
import {
    PiGraduationCapDuotone,
    PiUsersThreeDuotone,
    PiChalkboardTeacherDuotone,
    PiHouseLineDuotone,
    PiArrowRightBold,
} from 'react-icons/pi'
import { APP_NAME } from '@/constants/app.constant'

const features = [
    {
        icon: <PiGraduationCapDuotone className="text-4xl text-primary" />,
        title: 'Student Management',
        desc: 'Track student progress, grades, attendance, and profiles all in one place.',
    },
    {
        icon: <PiChalkboardTeacherDuotone className="text-4xl text-primary" />,
        title: 'Teacher Portal',
        desc: 'Manage classes, assignments, and student performance with ease.',
    },
    {
        icon: <PiUsersThreeDuotone className="text-4xl text-primary" />,
        title: 'Parent Access',
        desc: "Stay informed about your child's academic journey and school updates.",
    },
    {
        icon: <PiHouseLineDuotone className="text-4xl text-primary" />,
        title: 'Admin Dashboard',
        desc: 'Full visibility and control over your institution from a single panel.',
    },
]

const Landing = () => {
    const { authenticated } = useAuth()

    return (
        <div className="flex flex-col">
            {/* Hero */}
            <section className="flex flex-col items-center justify-center text-center px-6 py-28 bg-gradient-to-b from-primary/5 to-transparent">
                <h1 className="text-5xl font-extrabold heading-text mb-5 max-w-2xl leading-tight">
                    The Smart Platform for Modern Education
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl">
                    ECMC connects students, teachers, parents, and
                    administrators in one unified school management system.
                </p>
                <div className="flex gap-4">
                    {authenticated ? (
                        <Link
                            to="/dashboards/ecommerce"
                            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Go to Dashboard
                            <PiArrowRightBold />
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/sign-up"
                                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Get Started Free
                                <PiArrowRightBold />
                            </Link>
                            <Link
                                to="/sign-in"
                                className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors heading-text"
                            >
                                Sign In
                            </Link>
                        </>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="px-6 py-20 max-w-5xl mx-auto w-full">
                <h2 className="text-3xl font-bold heading-text text-center mb-12">
                    Everything your school needs
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="flex flex-col items-start gap-3 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            {f.icon}
                            <h3 className="font-bold heading-text">
                                {f.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            {!authenticated && (
                <section className="px-6 py-20 text-center bg-primary/5">
                    <h2 className="text-3xl font-bold heading-text mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Join thousands of schools already using {APP_NAME}.
                    </p>
                    <Link
                        to="/sign-up"
                        className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Create Free Account
                        <PiArrowRightBold />
                    </Link>
                </section>
            )}

            {/* Footer */}
            <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-200 dark:border-gray-700">
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </footer>
        </div>
    )
}

export default Landing

import LegalPageLayout from './LegalPageLayout'

const stats = [
    { label: 'Schools', value: '500+' },
    { label: 'Students', value: '50,000+' },
    { label: 'Countries', value: '20+' },
    { label: 'Uptime', value: '99.9%' },
]

const team = [
    { name: 'Sarah Johnson', role: 'CEO & Co-Founder' },
    { name: 'Michael Chen', role: 'CTO & Co-Founder' },
    { name: 'Priya Patel', role: 'Head of Product' },
    { name: 'James Williams', role: 'Head of Engineering' },
]

const AboutUs = () => {
    return (
        <LegalPageLayout title="About Us">
            <p className="text-lg">
                ECMC is a modern school management platform built to simplify
                administration, empower teachers, and keep students and parents
                connected — all in one place.
            </p>

            <section>
                <h2 className="text-xl font-semibold heading-text">Our Mission</h2>
                <p>
                    We believe every school deserves technology that works as hard as
                    its staff. Our mission is to reduce administrative burden and create
                    more time for what matters most — education.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">Our Story</h2>
                <p>
                    Founded in 2020, ECMC started as a small tool for a single school
                    district. Today, we serve hundreds of schools across 20+ countries,
                    helping administrators, teachers, students, and parents stay aligned
                    through a single, intuitive platform.
                </p>
            </section>

            <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl text-center"
                    >
                        <span className="text-3xl font-bold text-primary">{s.value}</span>
                        <span className="text-sm text-gray-500 mt-1">{s.label}</span>
                    </div>
                ))}
            </div>

            <section>
                <h2 className="text-xl font-semibold heading-text">Our Values</h2>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>Privacy first:</strong> We never sell user data.</li>
                    <li><strong>Simplicity:</strong> Powerful features without the complexity.</li>
                    <li><strong>Reliability:</strong> 99.9% uptime backed by a robust infrastructure.</li>
                    <li><strong>Inclusivity:</strong> Designed for schools of all sizes and backgrounds.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">Leadership Team</h2>
                <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {team.map((member) => (
                        <div
                            key={member.name}
                            className="flex flex-col items-center text-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl gap-2"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {member.name[0]}
                            </div>
                            <p className="font-semibold heading-text text-sm">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">Get in Touch</h2>
                <p>
                    Want to learn more or partner with us? Reach out at{' '}
                    <a href="mailto:hello@ecmc.com" className="text-primary hover:underline">
                        hello@ecmc.com
                    </a>{' '}
                    or visit our{' '}
                    <a href="/contact" className="text-primary hover:underline">
                        Contact page
                    </a>
                    .
                </p>
            </section>
        </LegalPageLayout>
    )
}

export default AboutUs

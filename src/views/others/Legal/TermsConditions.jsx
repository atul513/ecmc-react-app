import LegalPageLayout from './LegalPageLayout'

const TermsConditions = () => {
    return (
        <LegalPageLayout title="Terms &amp; Conditions" description="Read the terms and conditions for using the ECMC online exam platform." canonical="/terms" lastUpdated="March 24, 2026">
            <section>
                <h2 className="text-xl font-semibold heading-text">1. Acceptance of Terms</h2>
                <p>
                    By accessing or using ECMC ("the Platform"), you agree to be bound by
                    these Terms & Conditions. If you do not agree to all the terms, you may
                    not use the Platform.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">2. Use of the Platform</h2>
                <p>
                    The Platform is intended for use by authorized school administrators,
                    teachers, students, and parents. You agree to use the Platform only for
                    lawful purposes and in accordance with these Terms.
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>You must not misuse or attempt to gain unauthorized access to the Platform.</li>
                    <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                    <li>You must not upload or share harmful, unlawful, or offensive content.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">3. User Accounts</h2>
                <p>
                    Accounts are created and managed by school administrators. Each user is
                    responsible for all activity under their account. You must notify us
                    immediately of any unauthorized use of your account.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">4. Intellectual Property</h2>
                <p>
                    All content, trademarks, and software on the Platform are the property
                    of ECMC or its licensors. You may not reproduce, distribute, or create
                    derivative works without prior written consent.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">5. Limitation of Liability</h2>
                <p>
                    ECMC is not liable for any indirect, incidental, or consequential
                    damages arising from your use of the Platform. The Platform is provided
                    "as is" without warranties of any kind.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">6. Termination</h2>
                <p>
                    We reserve the right to suspend or terminate accounts that violate
                    these Terms without prior notice.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">7. Changes to Terms</h2>
                <p>
                    We may update these Terms from time to time. Continued use of the
                    Platform after changes constitutes your acceptance of the new Terms.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">8. Contact</h2>
                <p>
                    For questions about these Terms, contact us at{' '}
                    <a href="mailto:legal@ecmc.com" className="text-primary hover:underline">
                        legal@ecmc.com
                    </a>
                    .
                </p>
            </section>
        </LegalPageLayout>
    )
}

export default TermsConditions

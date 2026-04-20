import LegalPageLayout from './LegalPageLayout'
import { APP_NAME } from '@/constants/app.constant'

const PrivacyPolicy = () => {
    return (
        <LegalPageLayout title="Privacy Policy" description={`Understand how ${APP_NAME} collects, uses and protects your personal data.`} canonical="/privacy" lastUpdated="March 24, 2026">
            <p>
                {APP_NAME} is committed to protecting your personal data. This Privacy Policy
                explains how we collect, use, and safeguard your information in accordance
                with GDPR, CCPA, and applicable data protection laws.
            </p>

            <section>
                <h2 className="text-xl font-semibold heading-text">1. Data We Collect</h2>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>Account data:</strong> name, email address, role (admin, teacher, student, parent)</li>
                    <li><strong>Usage data:</strong> login times, pages visited, actions performed</li>
                    <li><strong>Student data:</strong> grades, attendance, assignments (collected on behalf of the school)</li>
                    <li><strong>Device data:</strong> IP address, browser type, operating system</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">2. How We Use Your Data</h2>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>To provide and improve Platform features</li>
                    <li>To authenticate users and manage sessions</li>
                    <li>To generate reports for school administrators</li>
                    <li>To send important notifications related to your account</li>
                    <li>To comply with legal obligations</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">3. Legal Basis (GDPR)</h2>
                <p>We process data under the following legal bases:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li><strong>Contract:</strong> to fulfil our service agreement with your school</li>
                    <li><strong>Legitimate interests:</strong> platform security and performance</li>
                    <li><strong>Legal obligation:</strong> where required by law</li>
                    <li><strong>Consent:</strong> for optional communications</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">4. California Rights (CCPA)</h2>
                <p>California residents have the right to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Know what personal information is collected and how it is used</li>
                    <li>Request deletion of personal information</li>
                    <li>Opt out of the sale of personal information (we do not sell data)</li>
                    <li>Non-discrimination for exercising these rights</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">5. Data Sharing</h2>
                <p>
                    We do not sell your personal data. We may share data with:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Authorized school staff within the Platform</li>
                    <li>Cloud hosting providers (under data processing agreements)</li>
                    <li>Law enforcement when legally required</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">6. Data Retention</h2>
                <p>
                    We retain personal data for as long as the school account is active or
                    as required by law. Upon account deletion, data is removed within 30 days.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">7. Your Rights</h2>
                <p>You have the right to access, correct, or delete your personal data. To exercise your rights, contact us at{' '}
                    <a href="mailto:privacy@ecmc.com" className="text-primary hover:underline">
                        privacy@ecmc.com
                    </a>
                    .
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">8. Cookies</h2>
                <p>
                    We use cookies to manage sessions and improve user experience. See our{' '}
                    <a href="/cookie-policy" className="text-primary hover:underline">
                        Cookie Policy
                    </a>{' '}
                    for details.
                </p>
            </section>
        </LegalPageLayout>
    )
}

export default PrivacyPolicy

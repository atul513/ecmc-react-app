import LegalPageLayout from './LegalPageLayout'

const RefundPolicy = () => {
    return (
        <LegalPageLayout title="Refund Policy" description="Read our refund and cancellation policy for ECMC subscriptions and plans." canonical="/refund-policy" lastUpdated="March 24, 2026">
            <p>
                This Refund Policy outlines the conditions under which ECMC processes
                refunds for subscription plans and paid services.
            </p>

            <section>
                <h2 className="text-xl font-semibold heading-text">1. Subscription Plans</h2>
                <p>
                    ECMC offers monthly and annual subscription plans for schools. All
                    subscriptions are billed in advance.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">2. Eligibility for Refunds</h2>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>
                        <strong>Annual plans:</strong> A pro-rata refund is available within
                        30 days of the billing date, minus any used period.
                    </li>
                    <li>
                        <strong>Monthly plans:</strong> Refunds are not provided for monthly
                        subscriptions once the billing cycle has started.
                    </li>
                    <li>
                        <strong>Free trials:</strong> No charges apply during the free trial
                        period; no refund is needed.
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">3. Non-Refundable Items</h2>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Setup or onboarding fees</li>
                    <li>Add-on services already delivered</li>
                    <li>Subscriptions cancelled after the 30-day window</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">4. How to Request a Refund</h2>
                <p>
                    To request a refund, email{' '}
                    <a href="mailto:billing@ecmc.com" className="text-primary hover:underline">
                        billing@ecmc.com
                    </a>{' '}
                    with your school name, invoice number, and reason for the refund request.
                    We will respond within 5 business days.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">5. Processing Time</h2>
                <p>
                    Approved refunds are processed within 7–10 business days and credited
                    to the original payment method.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">6. Changes to This Policy</h2>
                <p>
                    We reserve the right to update this Refund Policy. Changes will be
                    communicated via email to the account administrator.
                </p>
            </section>
        </LegalPageLayout>
    )
}

export default RefundPolicy

import LegalPageLayout from './LegalPageLayout'

const CookiePolicy = () => {
    return (
        <LegalPageLayout title="Cookie Policy" description="Read how ECMC uses cookies to improve your experience." canonical="/cookie-policy" lastUpdated="March 24, 2026">
            <p>
                This Cookie Policy explains how ECMC uses cookies and similar tracking
                technologies when you use our Platform.
            </p>

            <section>
                <h2 className="text-xl font-semibold heading-text">1. What Are Cookies?</h2>
                <p>
                    Cookies are small text files stored on your device by your browser.
                    They help us recognize your device and remember certain information
                    about your session.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">2. Cookies We Use</h2>
                <div className="overflow-x-auto mt-2">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-2 pr-4 font-semibold">Cookie</th>
                                <th className="text-left py-2 pr-4 font-semibold">Type</th>
                                <th className="text-left py-2 font-semibold">Purpose</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            <tr>
                                <td className="py-2 pr-4 font-mono text-xs">token</td>
                                <td className="py-2 pr-4">Essential</td>
                                <td className="py-2">Stores authentication session token</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-mono text-xs">sessionUser</td>
                                <td className="py-2 pr-4">Essential</td>
                                <td className="py-2">Stores user profile and role information</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-mono text-xs">themeStore</td>
                                <td className="py-2 pr-4">Functional</td>
                                <td className="py-2">Remembers your UI theme preference (dark/light)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">3. Cookie Categories</h2>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>
                        <strong>Essential cookies:</strong> Required for the Platform to
                        function. These cannot be disabled.
                    </li>
                    <li>
                        <strong>Functional cookies:</strong> Enhance your experience by
                        remembering preferences. You may opt out of these.
                    </li>
                    <li>
                        <strong>Analytics cookies:</strong> We do not currently use
                        third-party analytics cookies.
                    </li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">4. Managing Cookies</h2>
                <p>
                    You can control cookies through your browser settings. Disabling
                    essential cookies may prevent you from logging in or using the Platform.
                    Refer to your browser's help documentation to manage cookie preferences.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold heading-text">5. Contact</h2>
                <p>
                    For cookie-related questions, contact{' '}
                    <a href="mailto:privacy@ecmc.com" className="text-primary hover:underline">
                        privacy@ecmc.com
                    </a>
                    .
                </p>
            </section>
        </LegalPageLayout>
    )
}

export default CookiePolicy

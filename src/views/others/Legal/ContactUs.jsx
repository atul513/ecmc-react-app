import LegalPageLayout from './LegalPageLayout'
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi'

const ContactUs = () => {
    return (
        <LegalPageLayout title="Contact Us">
            <p>
                Have a question, issue, or feedback? Our team is here to help. Reach
                out through any of the channels below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose mt-4">
                <div className="flex flex-col items-center text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <HiOutlineMail size={22} />
                    </div>
                    <h3 className="font-semibold heading-text">Email</h3>
                    <a
                        href="mailto:support@ecmc.com"
                        className="text-primary hover:underline text-sm"
                    >
                        support@ecmc.com
                    </a>
                    <p className="text-xs text-gray-500">Response within 24 hours</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <HiOutlinePhone size={22} />
                    </div>
                    <h3 className="font-semibold heading-text">Phone</h3>
                    <a
                        href="tel:+1800000000"
                        className="text-primary hover:underline text-sm"
                    >
                        +1 (800) 000-0000
                    </a>
                    <p className="text-xs text-gray-500">Mon–Fri, 9am–5pm</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <HiOutlineLocationMarker size={22} />
                    </div>
                    <h3 className="font-semibold heading-text">Office</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        123 School Lane, Suite 100
                        <br />
                        New York, NY 10001
                    </p>
                </div>
            </div>

            <section className="mt-8">
                <h2 className="text-xl font-semibold heading-text">Send Us a Message</h2>
                <form className="mt-4 space-y-4 not-prose" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium heading-text">Name</label>
                            <input
                                type="text"
                                placeholder="Your name"
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium heading-text">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium heading-text">Subject</label>
                        <input
                            type="text"
                            placeholder="How can we help?"
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium heading-text">Message</label>
                        <textarea
                            rows={5}
                            placeholder="Describe your issue or question..."
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Send Message
                    </button>
                </form>
            </section>
        </LegalPageLayout>
    )
}

export default ContactUs

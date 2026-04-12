import NavigationBar from '@/views/others/Landing/components/NavigationBar'
import Container from '@/views/others/Landing/components/LandingContainer'
import useDarkMode from '@/utils/hooks/useDarkMode'
import { MODE_DARK, MODE_LIGHT } from '@/constants/theme.constant'
import SEO from '@/components/shared/SEO'

const LegalPageLayout = ({ title, description, canonical, lastUpdated, children }) => {
    const [isDark, setMode] = useDarkMode()
    const mode = isDark ? MODE_DARK : MODE_LIGHT

    const toggleMode = () =>
        setMode(mode === MODE_LIGHT ? MODE_DARK : MODE_LIGHT)

    const year = new Date().getFullYear()

    return (
        <div className="w-full min-h-screen flex flex-col">
            <SEO title={title} description={description} canonical={canonical} />
            <NavigationBar toggleMode={toggleMode} mode={mode} />
            <div className="flex-1 pt-28 pb-16">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold heading-text mb-2">
                            {title}
                        </h1>
                        {lastUpdated && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                                Last updated: {lastUpdated}
                            </p>
                        )}
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
                            {children}
                        </div>
                    </div>
                </Container>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 py-6">
                <Container>
                    <p className="text-center text-sm text-gray-500">
                        © {year} ECMC. All rights reserved.
                    </p>
                </Container>
            </div>
        </div>
    )
}

export default LegalPageLayout

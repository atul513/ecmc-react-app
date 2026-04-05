import { BrowserRouter } from 'react-router'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import './locales'
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt'
import PwaUpdatePrompt from '@/components/pwa/PwaUpdatePrompt'

if (appConfig.enableMock) {
    import('./mock')
}

function App() {
    return (
        <Theme>
            <BrowserRouter>
                <AuthProvider>
                    <Layout>
                        <Views />
                    </Layout>
                </AuthProvider>
                <PwaInstallPrompt />
                <PwaUpdatePrompt />
            </BrowserRouter>
        </Theme>
    )
}

export default App

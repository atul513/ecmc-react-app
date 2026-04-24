const appConfig = {
    apiPrefix: import.meta.env.VITE_API_BASE_URL || '/api',
    authenticatedEntryPath: '/app/admin/dashboard',
    unAuthenticatedEntryPath: '/landing',
    locale: 'en',
    accessTokenPersistStrategy: 'cookies',
    enableMock: false,
    activeNavTranslation: true,
}

export default appConfig


const appConfig = {
    apiPrefix: import.meta.env.VITE_API_BASE_URL || '/api',
    authenticatedEntryPath: '/dashboards/ecommerce',
    unAuthenticatedEntryPath: '/landing',
    locale: 'en',
    accessTokenPersistStrategy: 'cookies',
    enableMock: false,
    activeNavTranslation: true,
}

export default appConfig

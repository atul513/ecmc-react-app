import ApiService from './ApiService'

export async function apiGetGoogleRedirectUrl() {
    return ApiService.fetchDataWithAxios({
        url: '/auth/google/redirect',
        method: 'get',
    })
}

export async function apiGoogleCallback(code) {
    return ApiService.fetchDataWithAxios({
        url: '/auth/google/callback',
        method: 'post',
        data: { code },
    })
}

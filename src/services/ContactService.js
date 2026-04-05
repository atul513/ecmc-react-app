import ApiService from './ApiService'

const ADMIN_BASE = '/admin/contact-submissions'

export async function apiSubmitContact(data) {
    return ApiService.fetchDataWithAxios({
        url: '/contact',
        method: 'post',
        data,
    })
}

export async function apiGetContactSubmissions(params) {
    return ApiService.fetchDataWithAxios({
        url: ADMIN_BASE,
        method: 'get',
        params,
    })
}

export async function apiGetContactSubmission(id) {
    return ApiService.fetchDataWithAxios({
        url: `${ADMIN_BASE}/${id}`,
        method: 'get',
    })
}

export async function apiUpdateContactStatus(id, status) {
    return ApiService.fetchDataWithAxios({
        url: `${ADMIN_BASE}/${id}/status`,
        method: 'patch',
        data: { status },
    })
}

export async function apiDeleteContactSubmission(id) {
    return ApiService.fetchDataWithAxios({
        url: `${ADMIN_BASE}/${id}`,
        method: 'delete',
    })
}

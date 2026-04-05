import ApiService from './ApiService'

export async function apiGetHome(params) {
    return ApiService.fetchDataWithAxios({ url: '/home', method: 'get', params })
}

export async function apiGetHomePracticeSets(params) {
    return ApiService.fetchDataWithAxios({ url: '/home/practice-sets', method: 'get', params })
}

export async function apiGetHomeExams(params) {
    return ApiService.fetchDataWithAxios({ url: '/home/exams', method: 'get', params })
}

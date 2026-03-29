import ApiService from './ApiService'

// ─── ECMC Role Dashboards ─────────────────────────────────────────────────────
export async function apiGetStudentDashboard() {
    return ApiService.fetchDataWithAxios({ url: '/student/dashboard', method: 'get' })
}
export async function apiGetTeacherDashboard() {
    return ApiService.fetchDataWithAxios({ url: '/teacher/dashboard', method: 'get' })
}
export async function apiGetTeacherStudents(params) {
    return ApiService.fetchDataWithAxios({ url: '/teacher/students', method: 'get', params })
}
export async function apiGetAdminDashboard() {
    return ApiService.fetchDataWithAxios({ url: '/admin/dashboard', method: 'get' })
}
export async function apiGetAdminUsers(params) {
    return ApiService.fetchDataWithAxios({ url: '/admin/users', method: 'get', params })
}
export async function apiCreateAdminUser(data) {
    return ApiService.fetchDataWithAxios({ url: '/admin/users', method: 'post', data })
}
export async function apiGetSuperAdminDashboard() {
    return ApiService.fetchDataWithAxios({ url: '/superadmin/dashboard', method: 'get' })
}
export async function apiGetSuperAdminUsers(params) {
    return ApiService.fetchDataWithAxios({ url: '/superadmin/users', method: 'get', params })
}
export async function apiUpdateUserRole(id, data) {
    return ApiService.fetchDataWithAxios({ url: `/superadmin/users/${id}/role`, method: 'patch', data })
}
export async function apiGetParentDashboard() {
    return ApiService.fetchDataWithAxios({ url: '/parent/dashboard', method: 'get' })
}

// ─── Legacy Dashboard APIs ────────────────────────────────────────────────────
export async function apiGetEcommerceDashboard() {
    return ApiService.fetchDataWithAxios({
        url: '/api/dashboard/ecommerce',
        method: 'get',
    })
}

export async function apiGetProjectDashboard() {
    return ApiService.fetchDataWithAxios({
        url: '/api/dashboard/project',
        method: 'get',
    })
}

export async function apiGetAnalyticDashboard() {
    return ApiService.fetchDataWithAxios({
        url: '/api/dashboard/analytic',
        method: 'get',
    })
}

export async function apiGetMarketingDashboard() {
    return ApiService.fetchDataWithAxios({
        url: '/api/dashboard/marketing',
        method: 'get',
    })
}

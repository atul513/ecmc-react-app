import ApiService from './ApiService'

// ─── Profile (real API) ────────────────────────────────────────────────────────
export async function apiGetProfile() {
    return ApiService.fetchDataWithAxios({ url: '/profile', method: 'get' })
}
export async function apiUpdateProfile(data) {
    return ApiService.fetchDataWithAxios({ url: '/profile', method: 'put', data })
}
export async function apiUploadAvatar(formData) {
    return ApiService.fetchDataWithAxios({
        url: '/profile/avatar',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}
export async function apiRemoveAvatar() {
    return ApiService.fetchDataWithAxios({ url: '/profile/avatar', method: 'delete' })
}

// ─── Legacy mock endpoints ─────────────────────────────────────────────────────
export async function apiGetSettingsProfile() {
    return ApiService.fetchDataWithAxios({
        url: '/setting/profile',
        method: 'get',
    })
}

export async function apiGetSettingsNotification() {
    return ApiService.fetchDataWithAxios({
        url: '/setting/notification',
        method: 'get',
    })
}

export async function apiGetSettingsBilling() {
    return ApiService.fetchDataWithAxios({
        url: '/setting/billing',
        method: 'get',
    })
}

export async function apiGetSettingsIntergration() {
    return ApiService.fetchDataWithAxios({
        url: '/setting/intergration',
        method: 'get',
    })
}

export async function apiGetRolesPermissionsUsers(params) {
    return ApiService.fetchDataWithAxios({
        url: '/rbac/users',
        method: 'get',
        params,
    })
}

export async function apiGetRolesPermissionsRoles() {
    return ApiService.fetchDataWithAxios({
        url: '/rbac/roles',
        method: 'get',
    })
}

export async function apiGetPricingPlans() {
    return ApiService.fetchDataWithAxios({
        url: '/pricing',
        method: 'get',
    })
}

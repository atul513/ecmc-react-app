import ApiService from './ApiService'

export async function apiUploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return ApiService.fetchDataWithAxios({
        url: '/v1/media/upload',
        method: 'post',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

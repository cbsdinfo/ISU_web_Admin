import request from '@/utils/request'

const api = {
    Upload(data) {
        return request({
            url: '/Files/Upload',
            method: 'post',
            data
        })
    },
    Delete(data) {
        return request({
            url: '/Files/Delete',
            method: 'post',
            data
        })
    },
}

export default api

import request from '@/utils/request'

const api = {
  getList() {
    return request({
      url: '/applications/load',
      method: 'get'
    })
  }
}

export default api
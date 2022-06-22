import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/partnerStoreCategory/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/partnerStoreCategory/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/partnerStoreCategory/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/partnerStoreCategory/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/partnerStoreCategory/delete',
      method: 'post',
      data
    })
  },
}

export default api;
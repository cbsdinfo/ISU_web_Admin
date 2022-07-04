import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/coupon/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/coupon/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/coupon/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/coupon/update',
      method: 'post',
      data
    })
  }
}

export default api;
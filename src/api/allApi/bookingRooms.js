import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/bookingRoom/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/bookingRoom/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/bookingRoom/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/bookingRoom/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/bookingRoom/delete',
      method: 'post',
      data
    })
  },
}

export default api;
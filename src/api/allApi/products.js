import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/products/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/products/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/products/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/products/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/products/delete',
      method: 'post',
      data
    })
  },
}

export default api;
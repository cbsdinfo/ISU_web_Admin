import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/product/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/product/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/product/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/product/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/product/delete',
      method: 'post',
      data
    })
  },
}

export default api;
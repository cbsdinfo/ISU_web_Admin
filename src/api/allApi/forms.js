import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/forms/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/forms/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/forms/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/forms/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/forms/delete',
      method: 'post',
      data
    })
  }
}

export default api;
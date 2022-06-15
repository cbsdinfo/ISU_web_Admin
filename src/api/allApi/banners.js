import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/banner/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/banner/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/banner/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/banner/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/banner/delete',
      method: 'post',
      data
    })
  },
}

export default api;
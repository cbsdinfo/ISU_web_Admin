import request from '@/utils/request'

const api = {
  load(params) {
    return request({
      url: '/news/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/news/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/news/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/news/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/news/delete',
      method: 'post',
      data
    })
  },
}

export default api;
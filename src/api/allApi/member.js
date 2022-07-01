import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/member/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/member/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/member/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/member/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/member/delete',
      method: 'post',
      data
    })
  },
}

export default api;
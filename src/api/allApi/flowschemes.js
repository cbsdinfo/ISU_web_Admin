import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/flowschemes/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/flowschemes/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/flowschemes/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/flowschemes/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/flowschemes/delete',
      method: 'post',
      data
    })
  }
}

export default api;
import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/stampStoreProduct/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/stampStoreProduct/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/stampStoreProduct/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/stampStoreProduct/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/stampStoreProduct/delete',
      method: 'post',
      data
    })
  },
}

export default api;
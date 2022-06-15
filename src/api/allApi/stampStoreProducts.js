import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/stampStoreProducts/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/stampStoreProducts/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/stampStoreProducts/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/stampStoreProducts/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/stampStoreProducts/delete',
      method: 'post',
      data
    })
  },
}

export default api;
import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/productCategorys/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/productCategorys/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/productCategorys/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/productCategorys/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/productCategorys/delete',
      method: 'post',
      data
    })
  },
}

export default api;
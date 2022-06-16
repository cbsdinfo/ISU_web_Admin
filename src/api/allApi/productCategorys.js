import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/productCategory/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/productCategory/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/productCategory/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/productCategory/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/productCategory/delete',
      method: 'post',
      data
    })
  },
}

export default api;
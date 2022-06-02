import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/sysMessages/load',
      method: 'get',
      params
    })
  },
  read(data) {
    return request({
      url: '/sysMessages/read',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/sysMessages/delete',
      method: 'post',
      data
    })
  }
}

export default api;
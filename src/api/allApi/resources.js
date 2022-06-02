import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/resources/load',
      method: 'get',
      params
    })
  },
  loadForRole(roleId) {
    return request({
      url: '/resources/loadForRole',
      method: 'get',
      params: {
        appId: '',
        firstId: roleId
      }
    })
  },
  add(data) {
    return request({
      url: '/resources/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/resources/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/resources/delete',
      method: 'post',
      data
    })
  }
}

export default api;
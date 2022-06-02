import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/sysLogs/load',
      method: 'get',
      params
    })
  },
  loadForRole(roleId) {
    return request({
      url: '/sysLogs/loadForRole',
      method: 'get',
      params: {
        appId: '',
        firstId: roleId
      }
    })
  },
  add(data) {
    return request({
      url: '/sysLogs/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/sysLogs/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/sysLogs/delete',
      method: 'post',
      data
    })
  }
}

export default api;
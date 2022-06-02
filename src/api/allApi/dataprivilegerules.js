import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/dataPrivilegeRules/load',
      method: 'get',
      params
    })
  },
  loadForRole(roleId) {
    return request({
      url: '/dataPrivilegeRules/loadForRole',
      method: 'get',
      params: { appId: '', firstId: roleId }
    })
  },
  add(data) {
    return request({
      url: '/dataPrivilegeRules/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/dataPrivilegeRules/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/dataPrivilegeRules/delete',
      method: 'post',
      data
    })
  }
}

export default api
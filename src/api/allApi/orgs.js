import request from '@/utils/request'

const api = {
  get(params) {
    return request({
      url: '/orgs/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/orgs/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/orgs/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/orgs/delete',
      method: 'post',
      data
    })
  },
  // 新增用户
  AssignOrgUsers(data) {
    return request({
      url: '/AccessObjs/AssignOrgUsers',
      method: 'post',
      data
    })
  }
}

export default api;
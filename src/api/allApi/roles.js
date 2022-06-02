import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/roles/load',
      method: 'get',
      params
    })
  },
  /**
   * 是否忽略登录用户权限，直接获取全部数据
   * 用于可以跨部门选择角色的场景
   */
  loadAll(params) {
    return request({
      url: '/roles/loadall',
      method: 'get',
      params
    })
  },
  loadForUser(userId) {
    return request({
      url: '/roles/loadforuser',
      method: 'get',
      params: {
        userId: userId
      }
    })
  },
  add(data) {
    return request({
      url: '/roles/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/roles/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/roles/delete',
      method: 'post',
      data
    })
  },
  // 新增用户
  AssignRoleUsers(data) {
    return request({
      url: '/AccessObjs/AssignRoleUsers',
      method: 'post',
      data
    })
  }
}

export default api;
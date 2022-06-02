import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/users/load',
      method: 'get',
      params
    })
  },
  loadAll(params) {
    return request({
      url: '/users/loadall',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/users/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/users/addorupdate',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/users/addorupdate',
      method: 'post',
      data
    })
  },
  changePassword(data) {
    return request({
      url: '/users/changepassword',
      method: 'post',
      data
    })
  },
  changeProfile(data) {
    return request({
      url: '/users/changeprofile',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/users/delete',
      method: 'post',
      data
    })
  },
  loadByRole(params) {
    return request({
      url: '/users/loadByRole',
      method: 'get',
      params
    })
  },
  LoadByOrg(params) {
    return request({
      url: '/users/LoadByOrg',
      method: 'get',
      params
    })
  }
}

export default api;
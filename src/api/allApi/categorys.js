import request from '@/utils/request'

const api = {
  Load(params) {
    return request({
      url: '/categorys/load',
      method: 'get',
      params
    })
  },
  loadForRole(roleId) {
    return request({
      url: '/categorys/loadForRole',
      method: 'get',
      params: {
        appId: '',
        firstId: roleId
      }
    })
  },
  add(data) {
    return request({
      url: '/categorys/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/categorys/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/categorys/delete',
      method: 'post',
      data
    })
  },
  // categoryTypes
  addType(data) {
    return request({
      url: '/CategoryTypes/Add',
      method: 'post',
      data
    })
  },
  delType(data) {
    return request({
      url: '/CategoryTypes/Delete',
      method: 'post',
      data
    })
  },
  loadType(params) {
    return request({
      url: '/CategoryTypes/Load',
      method: 'get',
      params
    })
  }
}

export default api
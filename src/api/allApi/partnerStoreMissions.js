import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/partnerStoreMission/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/partnerStoreMission/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/partnerStoreMission/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/partnerStoreMission/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/partnerStoreMission/delete',
      method: 'post',
      data
    })
  },
}

export default api;
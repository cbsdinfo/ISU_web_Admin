import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/flowinstances/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/flowinstances/get',
      method: 'get',
      params
    })
  },
  queryHistories(params) {
    return request({
      url: '/flowinstances/queryHistories',
      method: 'get',
      params
    })
  },
  verify(data) {
    return request({
      url: '/flowinstances/verification',
      method: 'post',
      data
    })
  },
  recall(data) {
    return request({
      url: '/flowinstances/recall',
      method: 'post',
      data
    })
  },
  start(data) {
    return request({
      url: '/flowinstances/start',
      method: 'post',
      data
    })
  },
  add(data) {
    return request({
      url: '/flowinstances/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/flowinstances/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/flowinstances/delete',
      method: 'post',
      data
    })
  }
}

export default api;
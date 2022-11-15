import request from '@/utils/request'

const api = {
  consumptionRecordLoad(params) {
    return request({
      url: '/PartnerStore/ConsumptionRecordLoad',
      method: 'get',
      params
    })
  },
  getList(params) {
    return request({
      url: '/partnerStore/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/partnerStore/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/partnerStore/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/partnerStore/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/partnerStore/delete',
      method: 'post',
      data
    })
  },
}

export default api;
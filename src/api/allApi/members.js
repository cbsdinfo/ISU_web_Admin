import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/member/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/member/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/member/add',
      method: 'post',
      data
    })
  },
  addPoints(data) {
    return request({
      url: '/member/MemberPointsAdd',
      method: 'post',
      data
    })
  },
  cancelPoints(data) {
    return request({
      url: '/member/MemberPointsCancel',
      method: 'post',
      data
    })
  },
  memberCouponLoad(params) {
    return request({
      url: '/member/MemberCouponLoad',
      method: 'get',
      params
    })
  },
  memberPointsLoad(params) {
    return request({
      url: '/member/MemberPointsLoad',
      method: 'get',
      params
    })
  },
  update(data) {
    return request({
      url: '/member/update',
      method: 'post',
      data
    })
  }
}

export default api;
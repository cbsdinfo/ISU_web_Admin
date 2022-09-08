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
  //取得會員點數使用或取消資料 (Auth)
  memberPointsUseOrCancelLoad(params) {
    return request({
      url: '/member/MemberPointsUseOrCancelLoad',
      method: 'get',
      params
    })
  },
   //取得「所有」會員點數使用或取消資料 (Auth)
   memberPointsUseOrCancelAll(data) {
    return request({
      url: '/member/memberPointsUseOrCancelAll',
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
  //獲取點數紀錄
  memberPointsLoad(params) {
    return request({
      url: '/Member/MemberPointsLoad',
      method: 'get',
      params
    })
  },
  //獲取所有會員點數紀錄
  memberPointsAll(data) {
    return request({
      url: '/member/MemberPointsAll',
      method: 'post',
      data
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
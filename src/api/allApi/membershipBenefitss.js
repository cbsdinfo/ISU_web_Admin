import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/membershipBenefits/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/membershipBenefits/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/membershipBenefits/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/membershipBenefits/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/membershipBenefits/delete',
      method: 'post',
      data
    })
  },
}

export default api;
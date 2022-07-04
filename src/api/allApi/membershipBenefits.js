import request from '@/utils/request'

const api = {
  getMembershipBenefits(params) {
    return request({
      url: '/membershipBenefits/GetMembershipBenefits',
      method: 'get',
      params
    })
  },
  addOrUpdate(data) {
    return request({
      url: '/membershipBenefits/AddOrUpdate',
      method: 'post',
      data
    })
  },
}

export default api;
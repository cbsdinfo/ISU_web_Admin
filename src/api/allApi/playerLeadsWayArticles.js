import request from '@/utils/request'

const api = {
  getList(params) {
    return request({
      url: '/playerLeadsWayArticle/load',
      method: 'get',
      params
    })
  },
  get(params) {
    return request({
      url: '/playerLeadsWayArticle/get',
      method: 'get',
      params
    })
  },
  add(data) {
    return request({
      url: '/playerLeadsWayArticle/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/playerLeadsWayArticle/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/playerLeadsWayArticle/delete',
      method: 'post',
      data
    })
  },
}

export default api;
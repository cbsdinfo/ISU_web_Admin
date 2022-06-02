import request from '@/utils/request'

const api = {
  assign(data) {
    var obj = data;
    return request({
      url: '/accessobjs/unassign',
      method: 'post',
      data: {
        type: obj.type,
        firstId: obj.firstId
      }
    }).then(() => {
      request({
        url: '/accessobjs/assign',
        method: 'post',
        data
      })
    })
  }
}

export default api;
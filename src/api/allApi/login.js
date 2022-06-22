import request from '@/utils/request'
import { getToken } from '@/utils/auth'

const api = {
  getPermissionRoles() {
    return request({
      url: '/check/GetRoles',
      method: 'get',
      params: {
        token: getToken()
      }
    })
  },
  login(username, password, appkey) {
    return request({
      url: '/check/login',
      method: 'post',
      data: {
        Account: username,
        Password: password,
        AppKey: appkey
      }
    })
  },
  refresh(data) {
    return request({
      url: '/check/refreshToken',
      method: 'post',
      headers: { 'Content-Type': 'application/json-patch+json' },
      data
    })
  },
  getInfo(token) {
    return request({
      url: '/check/getusername',
      method: 'get',
      params: {
        token
      }
    })
  },
  getUserProfile() {
    return request({
      url: '/check/getuserprofile',
      method: 'get',
      params: {
        token: getToken()
      }
    })
  },
  getModules() {
    return request({
      url: '/check/getmodules',
      method: 'get',
      params: {
        token: getToken()
      }
    })
  },
  getModulesTree() {
    return request({
      url: '/Check/GetModulesTree',
      method: 'get',
      params: {
        token: getToken()
      }
    })
  },
  getOrgs() {
    return request({
      url: '/check/getorgs',
      method: 'get',
      params: {
        token: getToken()
      }
    })
  },
  getSubOrgs(data) {
    return request({
      url: '/check/getSubOrgs',
      method: 'get',
      params: data
    })
  },
  logout() {
    return request({
      url: '/check/logout',
      method: 'post'
    })
  }
}

export default api;
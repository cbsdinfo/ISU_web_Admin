import request from '@/utils/request'

const api = {
  get(params) {
    return request({
      url: '/modules/get',
      method: 'get',
      params
    })
  },
  loadMenus(moduleId) {
    return request({
      url: '/modules/loadmenus',
      method: 'get',
      params: {
        moduleId: moduleId
      }
    })
  },
  loadForRole(roleId) {
    return request({
      url: '/modules/loadforrole',
      method: 'get',
      params: {
        firstId: roleId
      }
    })
  },
  add(data) {
    return request({
      url: '/modules/add',
      method: 'post',
      data
    })
  },
  update(data) {
    return request({
      url: '/modules/update',
      method: 'post',
      data
    })
  },
  del(data) {
    return request({
      url: '/modules/delete',
      method: 'post',
      data
    })
  },
  addMenu(data) {
    return request({
      url: '/modules/addmenu',
      method: 'post',
      data
    })
  },
  updateMenu(data) {
    return request({
      url: '/modules/updatemenu',
      method: 'post',
      data
    })
  },
  delMenu(data) {
    return request({
      url: '/modules/deletemenu',
      method: 'post',
      data
    })
  },
  loadMenusForRole(roleId) {
    return request({
      url: '/modules/loadmenusforrole',
      method: 'get',
      params: {
        moduleId: '',
        firstId: roleId
      }
    })
  },
  getProperties(code) {
    return request({
      url: '/Check/GetProperties',
      method: 'get',
      params: {
        moduleCode: code
      }
    })
  },
  getModules(code) {
    return request({
      url: '/Check/GetModules',
      method: 'get',
      params: {
        moduleCode: code
      }
    })
  },
  loadPropertiesForRole(code, roleId) {
    return request({
      url: '/Modules/LoadPropertiesForRole',
      method: 'get',
      params: {
        moduleCode: code,
        roleId: roleId
      }
    })
  },
  assignDataProperty(code, roleId, properties) {
    return request({
      url: '/AccessObjs/AssignDataProperty',
      method: 'post',
      data: {
        moduleCode: code,
        roleId: roleId,
        'properties': properties
      }
    })
  },
  unAssignDataProperty(code, roleId) {
    return request({
      url: '/AccessObjs/UnAssignDataProperty',
      method: 'post',
      data: {
        moduleCode: code,
        roleId: roleId,
        'properties': []
      }
    })
  }
}

export default api;
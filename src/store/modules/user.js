import $api from '@/api/index.js';
import { getToken, setToken, removeToken } from '@/utils/auth'
import { local } from '@/utils'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    modules: null,
    defaultorg: null // 登入後預設的操作機構
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_MODULES: (state, modules) => {
      state.modules = modules
    },
    SET_DEFAULTORG: (state, org) => {
      state.defaultorg = org
    }
  },

  actions: {
    // 登入
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        $api.login.login(username, userInfo.password, userInfo.appkey).then((res) => {
          const {code, token} = res;
          if (code === 200) {
            local.removeItem('visitedViews')

            setToken(token)
            commit('SET_TOKEN', token)
            // const nowDate = new Date();
            // const expireDate = new Date(nowDate.setSeconds(nowDate.getSeconds() + 1800));
            // window.localStorage.setItem("refreshTime", expireDate);

            resolve('success')
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 獲取用戶信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        $api.login.getInfo(state.token).then(response => {
          commit('SET_NAME', response.result)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // todo:預設登入後取第一個機構的id作為預設，可以在【個人中心】界面修改預設
    // 在大型業務系統中，應該讓用戶登入成功後彈出選擇框選擇操作的機構
    GetDefaultOrg({ commit, state }) {
      return new Promise((resolve, reject) => {
        $api.login.getOrgs(state.token).then(response => {
          commit('SET_DEFAULTORG', response.result[0])
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 獲取用戶模塊
    GetModules({ commit, state }) {
      return new Promise((resolve, reject) => {
        $api.login.getModules(state.token).then(response => {
          commit('SET_MODULES', response.result)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 獲取用戶模塊
    GetModulesTree({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.modules != null) {
          resolve(state.modules)
          return
        }
        $api.login.getModulesTree(state.token).then(response => {
          commit('SET_MODULES', response.result)
          resolve(response.result)
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        $api.login.logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_MODULES', [])
          removeToken()
          local.removeItem('visitedViews')
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        local.removeItem('visitedViews')
        resolve()
      })
    }
  }
}

export default user

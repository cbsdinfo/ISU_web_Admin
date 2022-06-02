/**
 * @description: 下拉字典選項緩存
 * @author: liyubao | xufuxing
 * @version: 1.0
 * @update: 2021-09-15 liyubao 控制下拉框緩存主鍵不重複，去掉清空邏輯，後期優化
 */

 const app = {
  state: {
    typeDataLists: [],
    typeIds: [],
    count: 0
  },
  mutations: {
    SAVE_TYPE_DATA_LISTS: (state, data) => {
      if(state.typeDataLists.some(item => item.typeId == data.typeId)){
        return;
      }
      state.typeDataLists.push(data)
    },
    SAVE_TYPE_IDS: (state, data) => {
      if(state.typeIds.some(item => item == data)){
        return;
      }
      state.typeIds.push(data)
      state.count++
    },
    CLEAR_TYPE_DATAS: (state) => {
      //控制緩存的長度，先不刪除
      // state.count--
      if (state.count > 0) {
        return
      }
      // state.count = 0
      // state.typeIds = []
      // state.typeDataLists = []
    }
  },
  actions: {
    saveTypeDataLists: ({ commit }, data) => {
      commit('SAVE_TYPE_DATA_LISTS', data)
    },
    saveTypeIds: ({ commit }, data) => {
      commit('SAVE_TYPE_IDS', data)
    },
    clearTypeDatas: ({ commit }, data) => {
      commit('CLEAR_TYPE_DATAS', data)
    }
  },
  getters: {
    typeDataLists: state => state.typeDataLists,
    typeIds: state => state.typeIds
  }
}

export default app

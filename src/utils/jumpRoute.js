
/**
 * 用於路由強制跳轉。比如新增流程模板後，需要跳轉到流程列表頁面
 * @param {當前vue的this} _this 
 * @param {返回的路由路徑} targetUrl 
 */
 export function jump(_this, targetUrl){
  _this.$store.dispatch('delVisitedViews', _this.$route).then(() =>{
      _this.$store.dispatch('delVisitedViews', {path:targetUrl}).then(() =>{
        _this.$router.push(targetUrl)
      })
    })
}
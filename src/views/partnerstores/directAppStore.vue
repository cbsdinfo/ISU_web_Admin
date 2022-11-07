<template>
  <div>
    跳轉中......
  </div>
</template>

<script>
  export default {
    data() {
      return {
        
      }
    },
    mounted() {
      let ua = window.navigator.userAgent
      var android = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1; // 判斷android裝置
      var iOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判斷ios裝置
      
      //let getUrlString = new URL('https://github.com/search?storeID=347942604415045');//測試用
      let getUrlString = new URL(location.href);//正式站
      let urlQuery = getUrlString.searchParams.toString()
      
      if(android|| iOS){
        // let getUrlString = location.href;
        let queryArray = []
        let storeID = "" ;
        let storePwd = "" ;

        if(urlQuery){
          queryArray = urlQuery.split('=')
        }
        
        if(queryArray[0]==='storeID'){
          storeID = queryArray[1]
        }
        if(queryArray[0]==='storePwd'){
          storePwd = queryArray[1]
        }
        if(storeID && android){
          window.location.replace(`${'https://play.google.com/store/apps/details?id=com.isushop.isu'}${'&storeID='}${storeID}`);
          return
        }
        if(storePwd && android){
          window.location.replace(`${'https://play.google.com/store/apps/details?id=com.isushop.isu'}${'&storePwd='}${storePwd}`);
          return
        }
        if(storeID && iOS){
          window.location.replace(`${'https://apps.apple.com/us/app/愛嬉遊/id6443406642'}${'?storeID='}${storeID}`);
          return
        }
        if(storePwd && iOS){
          window.location.replace(`${'https://apps.apple.com/us/app/愛嬉遊/id6443406642'}${'?storePwd='}${storePwd}`);
          return
        }
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>
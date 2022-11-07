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
      
      // if(android || iOS){
        //拆出query參數
        let getUrlString = location.href;
        let Ary1 = getUrlString.split('?');//把問號(?)後的參數拆出來
        let Ary2 = Ary1[1].split('=')//把 key value拆出來
        let storeID = "" ;
        let storePwd = "" ;
        // window.alert(getUrlString)
        // window.alert(Ary1)
        // window.alert(Ary2)
        if(Ary2[0]==='storeID'){
          storeID = Ary2[1]
        }
        if(Ary2[0]==='storePwd'){
          storePwd = Ary2[1]
        }
        // window.alert(storeID)
        // window.alert(storePwd)
       
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
      // }
    },
  }
</script>

<style lang="scss" scoped>

</style>
import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/custom-theme/index.css'
import locale from 'element-ui/lib/locale/lang/zh-TW'
import VueContextMenu from 'vue-contextmenu'
import Swal from 'sweetalert2'
import dayjs from 'dayjs';
import * as filters from '@/utils/Filter'

import '@/styles/index.scss'

import App from './App'
import router from './router'
import store from './store'

import api from '@/api/index'
import '@/permission'

// import Vue2Editor from "vue2-editor";

import '@/assets/public/css/comIconfont/iconfont.css'
import '@/assets/public/css/comIconfont/iconfont.js'

//工作流使用的圖標
import '@/assets/public/css/workflowicon/iconfont.css'
import '@/assets/public/css/workflowicon/iconfont.js'
// Vue.use(Vue2Editor);
Vue.prototype.$dayjs = dayjs;
Vue.prototype.$api = api
Vue.use(ElementUI, { locale })
Vue.use(VueContextMenu)
Vue.prototype.$swal = Swal

Vue.config.productionTip = false

//執行Filter
Object.keys(filters).forEach(key => {
  Vue.filter(key,filters[key])
})
// Vue.filter('dateTimeFormatToDate', function (value) {
//   return dayjs(value).format("YYYY-MM-DD")
// })

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

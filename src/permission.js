import Vue from 'vue'
import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 進度條
import 'nprogress/nprogress.css'// Progress 進度條樣式
import { Message } from 'element-ui'
import { getToken, setToken } from '@/utils/auth' // 驗權
import Layout from "@/views/layout/Layout";

const whiteList = ['/login', '/oidc-callback', '/swagger', '/usermanager/profile'] // 不重定向白名單
/* 自動生成分頁 */
const autoAddPageList = [
  // { path: "/despatchs/index", title: "託運單管理", pageArr: [{ path: "add", title: "新增"}] }
]

router.beforeEach((to, from, next) => {
  NProgress.start();

  if (getToken()) {
    if (to.path === '/login') { // 登入後login自動跳轉
      next({ path: '/' })
      return
    }
    if (store.getters.modules != null) {
      next()
      return
    }
    store.dispatch('GetInfo').then(() => { // 拉取用戶信息
      store.dispatch('GetModulesTree').then(modules => { // 獲取用戶可訪問的模塊
        store.dispatch('GenerateRoutes', { modules }).then(() => { // 根據權限生成可訪問的路由表
          store.dispatch('GetDefaultOrg');

          let routerArr = JSON.parse(JSON.stringify(store.getters.addRouters));
          const addPagePaths = autoAddPageList.map((i) => i.path);
          routerArr.forEach((item) => {
            if ( addPagePaths.includes((item.path).toLowerCase()) ) {
              const fPath = item.path.split("/")[1]
              let childRoute = [];

              autoAddPageList.forEach((items) => {
                items.pageArr.forEach((obj) => {
                  childRoute = [
                    {
                      path: `/${fPath}`,
                      component: Layout,
                      redirect: `/${fPath}/index`,
                      name: fPath,
                      meta: {
                        title: items.title,
                        icon: items.icon
                      },
                      children: [
                        {
                          path: `${obj.path}`,
                          component: () => import(`@/views/${fPath}/${obj.path}`),
                          name: `${fPath}-${obj.path}`,
                          hidden: true,
                          meta: {
                            notauth: true,
                            noCache: true,
                            title: `${obj.title}${items.title}`,
                          },
                        },
                      ],
                    },
                  ];
                })
              });

              router.addRoutes(childRoute)
            }
          });

          router.addRoutes(store.getters.addRouters) // 動態新增可訪問路由表
          next({ ...to, replace: true }) // hack方法 確保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
        })
      })
    })
    .catch(() => {
      // TODO: 若錯誤，則刷新token
      Vue.prototype.$api.login.refresh(`"${getToken()}"`).then((res) => {
        console.log('refresh api', res);
        if (res) {
          const {code, token} = res;
          if (code === 200) {
            setToken(token);
            window.location.reload()
          } else {
            store.dispatch('FedLogOut').then(() => {
              Message.error('獲取用戶信息失敗')
              next({ path: '/' })
            })
          }
        } else {
          store.dispatch('FedLogOut').then(() => {
            Message.error('獲取用戶信息失敗')
            next({ path: '/' })
          })
        }
      })
    })
    return
  }
  if (whiteList.indexOf(to.path) !== -1) { // 沒登入情況下過濾白名單
        next()
  } else {
    console.log('go back login page', to);
    next('/login')
  }
})

router.afterEach(() => {
  NProgress.done() // 結束Progress
})

import Vue from 'vue'
import Router from 'vue-router'
import OidcCallback from '@/views/OidcCallback'
import oidcRedirect from '@/views/OidcRedirect'


// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  {
    path: '/directAppStore',
    component: () => import('@/views/partnerstores/directAppStore'),
    meta: {
      sortNo: 0
    },
    hidden: true
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    meta: {
      sortNo: 0
    },
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    meta: {
      sortNo: 0
    },
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    meta: {
      sortNo: 0
    },
    hidden: true
  },
  // 把二級路由提前加到路由表，實現路由緩存
  {
    path: '/flowinstances',
    component: Layout,
    redirect: 'noredirect',
    name: 'flowinstances',
    meta: {
      title: '流程中心',
      icon: 'guide'
    },
    children: [{
        path: 'detail/:id',
        component: () =>
          import('@/views/flowinstances/detail'),
        name: 'flowinstanceDtl',
        hidden: true,
        meta: {
          notauth: true,
          title: '流程詳情',
          noCache: true,
          icon: 'list'
        }
      },
      {
        path: 'verify/:id',
        component: () =>
          import('@/views/flowinstances/verify'),
        name: 'verifyFlowinstance',
        hidden: true,
        meta: {
          notauth: true,
          title: '處理流程',
          noCache: true,
          icon: 'list'
        }
      },

      {
        path: 'update/:id',
        component: () =>
          import('@/views/flowinstances/update'),
        name: 'updateFlowinstance',
        hidden: true,
        meta: {
          notauth: true,
          title: '編輯流程',
          noCache: true,
          icon: 'list'
        }
      },

      {
        path: 'add',
        component: () =>
          import('@/views/flowinstances/add'),
        name: 'instanceAdd',
        meta: {
          notauth: true,
          title: '發起流程',
          noCache: true,
          icon: 'star'
        }
      }
    ]
  },
  {
    path: '/oidc-callback', // Needs to match redirect_uri in you oidcSettings
    name: 'oidcCallback',
    component: OidcCallback,
    meta: {
      sortNo: 0,
      isOidcCallback: true,
      isPublic: true
    }
  },
  {
    path: '/oidcRedirect', // oidc臨時跳轉頁面
    name: 'oidcRedirect',
    meta: {
      sortNo: 0
    },
    component: oidcRedirect
  },
  {
    path: '/',
    component: Layout,
    redirect: 'dashboard',
    name: 'layout',
    meta: {
      sortNo: 0
    },
    children: [{
      path: '/dashboard',
      name: 'dashboard',
      meta: {
        title: '主頁',
        icon: 'iconfont icon-zhuyeicon',
        sortNo: 0
      },
      component: () => import('@/views/dashboard/index')
    }, {
      path: '/profile',
      name: 'profile',
      hidden: true,
      meta: {
        title: '個人中心',
        icon: 'guide',
        sortNo: 0
      },
      component: () => import('@/views/usermanager/profile')
    }, {
      // path: '/iframePage/:url/:name',
      path: '/iframePage/:code',
      name: 'iframePage',
      hidden: true,
      meta: {
        title: '接口文檔',
        icon: 'guide',
        sortNo: 0
      },
      component: () => import('@/views/iframePage/index')
    }]
  }
  // {
  //   path: '/',
  //   hidden: true,
  //   component: Layout,
  //   meta: { sortNo: 0 },
  //   children: [{
  //     path: '/profile',
  //     name: 'profile',
  //     meta: { title: '個人中心', icon: 'guide', sortNo: 0 },
  //     component: () => import('@/views/usermanager/profile')
  //   }]
  // }
  // {
  //   path: '/swagger',
  //   component: Layout,
  //   meta: { sortNo: 0 },
  //   children: [{
  //     path: '',
  //     name: 'swagger',
  //     meta: { title: '接口文檔', icon: 'guide', sortNo: 0 },
  //     component: () => import('@/views/swagger/index')
  //   }]
  // }
]

var router = new Router({
  // mode: 'history', //後端支持可開
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRouterMap
})

export default router
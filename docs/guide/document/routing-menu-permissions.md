# 路由菜单权限控制

到这里基本上所有的页面都已经开发完成了，现在我们需要对菜单做一个权限控制，需求如下：

- xiaoMing账号下可见页面为：工作台、收据开具、收据审核、收据查询、收据打印
- xiaoHong账号下可见页面为：工作台、收据收款、收据查询

## 修改用户信息相关Mock

修改src/mock/services/auth.js文件：

```javascript
import Mock from 'mockjs2'
import { builder, getBody } from '../util'

const username = ['xiaoMing', 'xiaoHong']
// 强硬要求 ant.design 相同密码
// '21232f297a57a5a743894a0e4a801fc3',
const password = ['8914de686ab28dc22f30d3d8e107ff6c', '21232f297a57a5a743894a0e4a801fc3'] // admin, ant.design

const login = (options) => {
  const body = getBody(options)
  console.log('mock: body', body)
  if (!username.includes(body.username) || !password.includes(body.password)) {
    return builder({ isLogin: true }, '账户或密码错误', 401)
  }

  return builder(
    {
      id: Mock.mock('@guid'),
      name: Mock.mock('@name'),
      username: body.username,
      password: '',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/jZUIxmJycoymBprLOUbT.png',
      status: 1,
      telephone: '',
      lastLoginIp: '27.154.74.117',
      lastLoginTime: 1534837621348,
      creatorId: 'admin',
      createTime: 1497160610259,
      deleted: 0,
      roleId: body.username,
      lang: 'zh-CN',
      token: '4291d7da9005377ec9aec4a71ea837f',
    },
    '',
    200,
    { 'Custom-Header': Mock.mock('@guid') }
  )
}

const logout = () => {
  return builder({}, '[测试接口] 注销成功')
}

const smsCaptcha = () => {
  return builder({ captcha: Mock.mock('@integer(10000, 99999)') })
}

const twofactor = () => {
  return builder({ stepCode: Mock.mock('@integer(0, 1)') })
}

Mock.mock(/\/auth\/login/, 'post', login)
Mock.mock(/\/auth\/logout/, 'post', logout)
Mock.mock(/\/account\/sms/, 'post', smsCaptcha)
Mock.mock(/\/auth\/2step-code/, 'post', twofactor)
```

修改src/mock/services/user.js文件：

```javascript
import Mock from 'mockjs2'
import { builder, getBody } from '../util'

const info = (options) => {
  console.log('options', options)
  const body = getBody(options)
  const userInfo = {
    id: '4291d7da9005377ec9aec4a71ea837f',
    name: '天野远子',
    username: body.username,
    password: '',
    avatar: '/avatar2.jpg',
    status: 1,
    telephone: '',
    lastLoginIp: '27.154.74.117',
    lastLoginTime: 1534837621348,
    creatorId: 'admin',
    createTime: 1497160610259,
    merchantCode: 'TLif2btpzg079h15bk',
    deleted: 0,
    roleId: body.username,
    role: {},
  }

  switch (userInfo.roleId) {
    case 'xiaoMing':
      userInfo.role = {
        id: 'xiaoMing',
        name: '管理员',
        describe: '拥有所有权限',
        permissions: [
          {
            roleId: 'xiaoMing',
            permissionId: 'workSpace',
            permissionName: '工作台',
            actionEntitySet: [
              {
                action: 'receiptIssued',
                describe: '收据开具',
                defaultCheck: false,
              },
              {
                action: 'receiptAudit',
                describe: '收据审核',
                defaultCheck: false,
              },
              {
                action: 'receiptQuery',
                describe: '收据查询',
                defaultCheck: false,
              },
              {
                action: 'receiptPrintList',
                describe: '收据打印',
                defaultCheck: false,
              },
            ],
            actionList: null,
            dataAccess: null,
          },
          {
            roleId: 'xiaoMing',
            permissionId: 'receiptIssued',
            permissionName: '收据开具',
            actionEntitySet: [],
            actionList: null,
            dataAccess: null,
          },
          {
            roleId: 'xiaoMing',
            permissionId: 'receiptAudit',
            permissionName: '收据审核',
            actionEntitySet: [],
            actionList: null,
            dataAccess: null,
          },
          {
            roleId: 'xiaoMing',
            permissionId: 'receiptPrintList',
            permissionName: '收据打印',
            actionEntitySet: [],
            actionList: null,
            dataAccess: null,
          },
          {
            roleId: 'xiaoMing',
            permissionId: 'receiptQuery',
            permissionName: '收据查询',
            actionEntitySet: [],
            actionList: null,
            dataAccess: null,
          },
        ],
      }
      break
    case 'xiaoHong':
      userInfo.role = {
        id: 'xiaoHong',
        name: '管理员',
        describe: '拥有所有权限',
        permissions: [
          {
            roleId: 'xiaoHong',
            permissionId: 'workSpace',
            permissionName: '工作台',
            actionEntitySet: [
              {
                action: 'receiptCollection',
                describe: '收据收款',
                defaultCheck: false,
              },
              {
                action: 'receiptQuery',
                describe: '收据查询',
                defaultCheck: false,
              },
            ],
            actionList: null,
            dataAccess: null,
          },
          {
            roleId: 'xiaoHong',
            permissionId: 'receiptCollection',
            permissionName: '收据收款',
            actionEntitySet: [],
            actionList: null,
            dataAccess: null,
          },
          {
            roleId: 'xiaoHong',
            permissionId: 'receiptQuery',
            permissionName: '收据查询',
            actionEntitySet: [],
            actionList: null,
            dataAccess: null,
          },
        ],
      }
      break
    default:
      break
  }

  return builder(userInfo)
}

Mock.mock(/\/api\/user\/info/, 'get', info)
```

## 修改状态管理

这里登录过程就不讲了~主要讲用户登录过后，通过根据抓取到的用户信息里面的角色来进行权限分配，这里用到了Vuex(全局状态管理)，它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。我们只需要把一些频繁使用的值(例如：用户信息、角色权限等)定义在VueX中，即可在整个Vue项目的组件中使用。

修改src/store/modules/user.js文件：

```javascript
import storage from 'store'
import { login, getInfo, logout } from '@/api/login'
import { ACCESS_TOKEN, USER_NAME } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
  state: {
    token: '',
    name: '',
    welcome: '',
    avatar: '',
    roles: [],
    info: {},
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { name, welcome }) => {
      state.name = name
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo)
          .then((response) => {
            const result = response.result
            storage.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
            commit('SET_TOKEN', result.token)
            storage.set(USER_NAME, result.username) // 缓存用户名
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // 获取用户信息
    GetInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo({ username: storage.get(USER_NAME) }) // 这里传一个用户名
          .then((response) => {
            const result = response.result

            if (result.role && result.role.permissions.length > 0) {
              const role = result.role
              role.permissions = result.role.permissions
              role.permissions.map((per) => {
                if (per.actionEntitySet != null && per.actionEntitySet.length > 0) {
                  const action = per.actionEntitySet.map((action) => {
                    return action.action
                  })
                  per.actionList = action
                }
              })
              role.permissionList = role.permissions.map((permission) => {
                return permission.permissionId
              })
              commit('SET_ROLES', result.role)
              commit('SET_INFO', result)
            } else {
              reject(new Error('getInfo: roles must be a non-null array !'))
            }

            commit('SET_NAME', { name: result.name, welcome: welcome() })
            commit('SET_AVATAR', result.avatar)

            resolve(response)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise((resolve) => {
        logout(state.token)
          .then(() => {
            resolve()
          })
          .catch(() => {
            resolve()
          })
          .finally(() => {
            commit('SET_TOKEN', '')
            commit('SET_ROLES', [])
            storage.remove(ACCESS_TOKEN)
          })
      })
    },
  },
}

export default user
```

## 配置路由

修改src/config/router.config.js文件：

```javascript
// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

// const RouteView = {
//   name: 'RouteView',
//   render: (h) => h('router-view'),
// }

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/work-space',
    children: [
      {
        path: 'work-space',
        name: 'workSpace',
        component: () => import('@/views/dashboard/WorkSpace'),
        meta: { title: '工作台', icon: bxAnaalyse, permission: ['workSpace'] },
      },
      {
        path: 'receipt-issued',
        name: 'receiptIssued',
        component: () => import('@/views/receiptIssu/ReceiptIssu'),
        meta: { title: '收据开具', icon: bxAnaalyse, permission: ['receiptIssued'] },
      },
      {
        path: 'receipt-collection',
        name: 'receiptCollection',
        component: () => import('@/views/receiptPayment/ReceiptPayment'),
        meta: { title: '收据收款', icon: bxAnaalyse, permission: ['receiptCollection'] },
      },
      {
        path: 'receipt-audit',
        name: 'receiptAudit',
        component: () => import('@/views/receiptAudit/ReceiptAudit'),
        meta: { title: '收据审核', icon: bxAnaalyse, permission: ['receiptAudit'] },
      },
      {
        path: 'receipt-query',
        name: 'receiptQuery',
        component: () => import('@/views/receiptTheQuery/ReceiptTheQuery'),
        meta: { title: '收据查询', icon: bxAnaalyse, permission: ['receiptQuery'] },
      },
      {
        path: 'receipt-print-list',
        name: 'receiptPrintList',
        component: () => import('@/views/receiptPrintList/ReceiptPrintList'),
        meta: { title: '收据打印', icon: bxAnaalyse, permission: ['receiptPrintList'] },
      },
      {
        path: 'receipt-print',
        name: 'receiptPrint',
        component: () => import('@/views/receiptPrint/ReceiptPrint'),
        meta: { title: '收据打印详情', permission: ['receiptPrintList'] },
        hidden: true,
      },
    ],
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true,
  },
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login'),
      },
    ],
  },
]
```

`{ Route }` 对象

| 参数               | 说明                                              | 类型    | 默认值 |
| :----------------- | :------------------------------------------------ | :------ | :----- |
| hidden             | 控制路由和子路由是否显示在 菜单                   | boolean | false  |
| redirect           | 重定向地址, 访问这个路由时,自定进行重定向         | string  | -      |
| name               | 路由名称, 必须设置,且不能重名                     | string  | -      |
| meta               | 路由元信息（路由附带扩展信息）                    | object  | {}     |
| hideChildrenInMenu | 强制菜单显示为Item而不是SubItem(配合 meta.hidden) | boolean | -      |

`{ Meta }` 路由元信息对象

| 参数                | 说明                                                         | 类型         | 默认值 |
| :------------------ | :----------------------------------------------------------- | :----------- | :----- |
| title               | 路由标题, 用于显示面包屑, 页面标题                           | string       | -      |
| icon                | 路由在 菜单 上显示的图标                                     | [string,svg] | -      |
| keepAlive           | 缓存该路由 (开启 multi-tab 是默认值为 true)                  | boolean      | false  |
| hiddenHeaderContent | *特殊 隐藏 [PageHeader](https://github.com/sendya/ant-design-pro-vue/blob/master/src/components/layout/PageHeader.vue#L14) 组件中的页面带的 面包屑和页面标题栏 | boolean      | false  |
| permission          | 与项目提供的权限拦截匹配的权限，如果不匹配，则会被禁止访问该路由页面 | array        | []     |

## 过滤权限相关方法

在src/store/modules/permission.js存放着过滤权限的相关方法：

```javascript
import { asyncRouterMap, constantRouterMap } from '@/config/router.config'

/**
 * 过滤账户是否拥有某一个权限，并将菜单从加载列表移除
 *
 * @param permission
 * @param route
 * @returns {boolean}
 */
function hasPermission(permission, route) {
  if (route.meta && route.meta.permission) {
    let flag = false
    for (let i = 0, len = permission.length; i < len; i++) {
      flag = route.meta.permission.includes(permission[i])
      if (flag) {
        return true
      }
    }
    return false
  }
  return true
}

/**
 * 单账户多角色时，使用该方法可过滤角色不存在的菜单
 *
 * @param roles
 * @param route
 * @returns {*}
 */
// eslint-disable-next-line
function hasRole(roles, route) {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.includes(roles.id)
  } else {
    return true
  }
}

function filterAsyncRouter(routerMap, roles) {
  const accessedRouters = routerMap.filter((route) => {
    if (hasPermission(roles.permissionList, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise((resolve) => {
        const { roles } = data
        const accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    },
  },
}

export default permission
```

## 路由守卫

正如其名，`vue-router` 提供的守卫主要用来通过跳转或取消的方式守卫路由。在路由守卫里，可以判断当前要进入的路由页面是否在当前角色的路由表里，以此来判断是否放行。

`main.js`目录下`permission.js`

```javascript
import router from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { i18nRender } from '@/locales'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['login', 'register', 'registerResult'] // no redirect whitelist
const loginRoutePath = '/user/login'
const defaultRoutePath = '/dashboard/workplace'

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  to.meta && typeof to.meta.title !== 'undefined' && setDocumentTitle(`${i18nRender(to.meta.title)} - ${domTitle}`)
  /* has token */
  if (storage.get(ACCESS_TOKEN)) {
    if (to.path === loginRoutePath) {
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      // check login user.roles is null
      if (store.getters.roles.length === 0) {
        // request login userInfo
        store
          .dispatch('GetInfo')
          .then((res) => {
            const roles = res.result && res.result.role
            // generate dynamic router
            store.dispatch('GenerateRoutes', { roles }).then(() => {
              // 根据roles权限生成可访问的路由表
              // 动态添加可访问路由表
              router.addRoutes(store.getters.addRouters)
              // 请求带有 redirect 重定向时，登录自动重定向到该地址
              const redirect = decodeURIComponent(from.query.redirect || to.path)
              if (to.path === redirect) {
                // set the replace: true so the navigation will not leave a history record
                next({ ...to, replace: true })
              } else {
                // 跳转到目的路由
                next({ path: redirect })
              }
            })
          })
          .catch(() => {
            notification.error({
              message: '错误',
              description: '请求用户信息失败，请重试',
            })
            // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
            store.dispatch('Logout').then(() => {
              next({ path: loginRoutePath, query: { redirect: to.fullPath } })
            })
          })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.name)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next({ path: loginRoutePath, query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
```

## 指令权限

在实际应用中，不止菜单有权限控制，页面上的组件、按钮之类的也会有权限控制，就像我在前言里说的一些角色他们能看到同一个页面，但是其中一个只能查看看，而另一个就可以编辑。这里我们可以通过自定义指令来实现，在配置角色权限里有一个actionEntitySet数组，这里存放的就是这类权限。

新建一个自定义指令`action.js`，然后在`main.js`里引入即可

```javascript
import Vue from 'vue'
import store from '@/store'

/**
 * Action 权限指令
 * 指令用法：
 *  - 在需要控制 action 级别权限的组件上使用 v-action:[method] , 如下：
 *    <i-button v-action:add >添加用户</a-button>
 *    <a-button v-action:delete>删除用户</a-button>
 *    <a v-action:edit @click="edit(record)">修改</a>
 *
 *  - 当前用户没有权限时，组件上使用了该指令则会被隐藏
 *  - 当后台权限跟 pro 提供的模式不同时，只需要针对这里的权限过滤进行修改即可
 *
 *  @see https://github.com/vueComponent/ant-design-vue-pro/pull/53
 */
const action = Vue.directive('action', {
  inserted: function (el, binding, vnode) {
    const actionName = binding.arg
    const roles = store.getters.roles
    const elVal = vnode.context.$route.meta.permission
    const permissionId = (elVal instanceof String && [elVal]) || elVal
    roles.permissions.forEach((p) => {
      if (!permissionId.includes(p.permissionId)) {
        return
      }
      if (p.actionList && !p.actionList.includes(actionName)) {
        ;(el.parentNode && el.parentNode.removeChild(el)) || (el.style.display = 'none')
      }
    })
  },
})

export default action
```

## 效果图

- xiaoMing

  ![xiaoming](https://figure-b.ricardolsw.com/image/xiaoming.png)

- xiaoHong

  ![xiaohong](https://figure-b.ricardolsw.com/image/xiaohong.png)

## 原理图

![](https://figure-b.ricardolsw.com/image/watermark.png)


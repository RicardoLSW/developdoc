# 网络请求封装

这里我们使用`axios`库封装项目中用到的网络请求接口，并且实现全局错误处理、添加请求头。

## 异常拦截处理

在项目中`utils`文件夹中有一个`request.js`是为我们封装好的axios实例，在这里面来实现我们的异常拦截处理以及自定义请求头。

先修改errorHandler的内容：

```javascript
// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    const token = storage.get(ACCESS_TOKEN)
    switch (error.response.status) {
      case 403:
        notification.error({ message: '系统提示', description: '拒绝访问', duration: 4 })
        break
      case 500:
        notification.error({ message: '系统提示', description: '服务器异常', duration: 4 })
        break
      case 404:
        notification.error({ message: '系统提示', description: '很抱歉，资源未找到!', duration: 4 })
        break
      case 504:
        notification.error({ message: '系统提示', description: '网络超时' })
        break
      case 401:
        notification.error({ message: '系统提示', description: '未授权，请重新登录', duration: 4 })
        if (token) {
          Modal.error({
            title: '未授权，请重新登录',
            content: '很抱歉，未授权，请重新登录',
            okText: '重新登录',
            mask: false,
            onOk: () => {
              store.dispatch('Logout').then()
            },
          })
        }
        break
      case 700:
        notification.error({ message: '系统提示', description: error.response.data.error, duration: 4 })
        break
      default:
        notification.error({
          message: '系统提示',
          description: data.message,
          duration: 4,
        })
        break
    }
  }
  return Promise.reject(error)
}
```

::: tip 注意

上面的700状态码为后端服务自定义的状态码。

:::

在request interceptor和response interceptor中使用：

```javascript
// request interceptor
request.interceptors.request.use((config) => {
  const token = storage.get(ACCESS_TOKEN)
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers['Access-Token'] = token
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  return response.data
}, errorHandler)
```

::: tip 提示

在request interceptor里我们可以添加自定义的请求头，例如：token。

:::

## 封装网络请求

一个完整的项目，可能会涉及很多网络请求，为了便于管理，最好的做法就是将所有网络请求放到同一个源码文件中。

在api文件夹下新建manage.js文件：

```javascript
import { axios } from '@/utils/request'
 
// post
export function postAction(url, parameter) {
  return axios({
    url: url,
    method: 'post',
    data: parameter,
  })
}
 
// post method= {post | put}
export function httpAction(url, parameter, method) {
  return axios({
    url: url,
    method: method,
    data: parameter,
  })
}
 
// put
export function putAction(url, parameter) {
  return axios({
    url: url,
    method: 'put',
    data: parameter,
  })
}
 
// get
export function getAction(url, parameter) {
  return axios({
    url: url,
    method: 'get',
    params: parameter,
  })
}
 
// deleteAction
export function deleteAction(url, parameter) {
  return axios({
    url: url,
    method: 'delete',
    params: parameter,
  })
}
 
// patchAction
export function patchAction(url, parameter) {
  return axios({
    url,
    method: 'patch',
    data: parameter,
  })
}
 
// exportAction
export function exportAction(url, parameter) {
  return axios({
    url: url,
    method: 'get',
    params: parameter,
    responseType: 'blob',
  })
}
```

## 如何使用

在src/api目录下新建api.js文件用于存放接口地址：

```javascript
// eslint-disable-next-line
import { getAction } from '@/api/manage'

const getReceiptTotal = (params) => getAction('/receipt-total', params) // 工作台-数据

export { getReceiptTotal }
```

然后我们可以直接在页面使用：

```javascript
getReceiptTotal().then((res) => {
  console.log(res)
})
```


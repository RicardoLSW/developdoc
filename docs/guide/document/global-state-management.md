# 全局状态管理

在一款应用中通常会包含一些贯穿整个应用生命周期的变量信息，这些信息在应用中大多数地方可能都会被用到，比如当前用户信息、Local信息等。我们把需要全局共享的信息分为两类：全局变量和共享状态。全局变量就是单纯指会贯穿整个应用生命周期的变量，用于单纯的保存一些信息，或者封装一些全局工具和方法的对象。而共享状态则是指哪些需要跨组件或跨路由共享的信息，这些信息通常也是全局变量，而共享状态和全局变量的不同在于前者发生改变时需要通知所有使用该状态的组件，而后者不需要。为此，我们将全局变量和共享状态分开单独管理。

## 全局样式

在src目录下新建global.scss样式文件，然后在这个文件配置我们的全局样式：

```scss
.flex-row {
  display: flex;
  flex-flow: row nowrap;
}

.flex-column {
  display: flex;
  flex-flow: column nowrap;
}

.flex-row-space-around {
  @extend .flex-row;
  justify-content: space-around;
  align-items: center;
}

.flex-column-space-around {
  @extend .flex-column;
  justify-content: space-around;
  align-items: center;
}
```

::: tip 注意

这里我们使用的是sass，需要安装sass-loader、node-sass这两个开发依赖。

运行`yarn add -D sass-loader node-sass`安装依赖即可

:::

在main.js引入我们的全局样式文件：

```javascript
import './global.scss'
```



## 工具类

在src/utils/util.js文件里存放着所有常用的工具类，可以全局使用：

```javascript
export function timeFix() {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

export function welcome() {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '要不要打一把 DOTA', '我猜你可能累了']
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent() {
  const event = document.createEvent('HTMLEvents')
  event.initEvent('resize', true, true)
  event.eventType = 'message'
  window.dispatchEvent(event)
}

export function handleScrollHeader(callback) {
  let timer = 0

  let beforeScrollTop = window.pageYOffset
  callback = callback || function () {}
  window.addEventListener(
    'scroll',
    (event) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let direction = 'up'
        const afterScrollTop = window.pageYOffset
        const delta = afterScrollTop - beforeScrollTop
        if (delta === 0) {
          return false
        }
        direction = delta > 0 ? 'down' : 'up'
        callback(direction)
        beforeScrollTop = afterScrollTop
      }, 50)
    },
    false
  )
}

export function isIE() {
  const bw = window.navigator.userAgent
  const compare = (s) => bw.indexOf(s) >= 0
  const ie11 = (() => 'ActiveXObject' in window)()
  return compare('MSIE') || ie11
}

/**
 * Remove loading animate
 * @param id parent element id or class
 * @param timeout
 */
export function removeLoadingAnimate(id = '', timeout = 1500) {
  if (id === '') {
    return
  }
  setTimeout(() => {
    document.body.removeChild(document.getElementById(id))
  }, timeout)
}

/**
 * 判断对象是否为空
 * @param {*} obj
 */
export function isEmpty(obj) {
  return (
    obj === undefined ||
    obj === null ||
    (typeof obj === 'string' && obj.trim().length === 0) ||
    JSON.stringify(obj) === '{}'
  )
}
```

::: tip 提示

我们也可以把自己常用的工具类放到这里面方便使用

:::
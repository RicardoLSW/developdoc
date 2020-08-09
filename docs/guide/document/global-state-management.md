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


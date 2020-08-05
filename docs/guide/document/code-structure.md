# 代码结构

依据原型图，可以使用一款现有的框架[Ant Design Pro](https://pro.antdv.com/docs/getting-started)，这是一款比较容易上手的企业级中后台前端/设计解决方案，它基于[Ant Design Pro](https://pro.antdv.com/docs/getting-started)并提供了一些常用的模板、组件，可以帮助你快速搭建企业级中后台产品原型。

## 创建项目

从 GitHub 仓库中直接安装最新的脚手架代码。

```shell
$ git clone --depth=1 https://github.com/vueComponent/ant-design-vue-pro.git electronic-receipt-system
$ cd electronic-receipt-system
```

## 目录结构

该框架已经为我们生成好了一套完整的开发框架，提供了涵盖中后台开发的各类功能和坑位，下面是整个项目的目录结构。

```
├── public
│   └── logo.png             # LOGO
|   └── index.html           # Vue 入口模板
├── src
│   ├── api                  # Api ajax 等
│   ├── assets               # 本地静态资源
│   ├── config               # 项目基础配置，包含路由，全局设置
│   ├── components           # 业务通用组件
│   ├── core                 # 项目引导, 全局配置初始化，依赖包引入等
│   ├── router               # Vue-Router
│   ├── store                # Vuex
│   ├── utils                # 工具库
│   ├── locales              # 国际化资源
│   ├── views                # 业务页面入口和常用模板
│   ├── App.vue              # Vue 模板入口
│   └── main.js              # Vue 入口 JS
│   └── permission.js        # 路由守卫(路由权限控制)
│   └── global.less          # 全局样式
├── tests                    # 测试工具
├── README.md
└── package.json
```

## 本地开发

安装依赖。

```shell
$ yarn install
```

> 如果网络情况不好，可以使用`cnpm`

```shell
$ yarn run serve
```

启动完成后会自动打开浏览器访问[http://localhost:8000](http://localhost:8000)。

![fehelper-localhost-8000-user-login-1596588154057](https://figure-b.ricardolsw.com/image/fehelper-localhost-8000-user-login-1596588154057.png) 
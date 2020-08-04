# 前端环境搭建

## 前言

> [Vue](https://cn.vuejs.org/)是一套用于构建用户界面的渐进式框架。与其它大型框架不同的是，Vue被设计为可以自底向上逐层应用。Vue的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与现代化的工具链以及各种支持类库结合使用时，Vue也完全能够为复杂的单页应用提供驱动。
>
> 本系列将带着大家从零开始快速入门Vue。

## 环境搭建

### 1.安装nvm（Node.js版本管理器）

[Node.js](https://nodejs.org/)是一个基于Chrome V8引擎的JavaScript运行环境，它是一个让JavaScript运行在服务端的开发平台。目前Node.js最新版本为v14.0.0。由于Node.js更新速度快，有时候新版本还会将旧版本的一些API废除，以至于写好的代码不能向下兼容。为了应对这种情况，我们可以使用[nvm](https://github.com/nvm-sh/nvm)管理器，它是一款Node.js版本管理器，它能够在一台机器上维护多个版本的Node.js，可以按需切换。

1. Mac使用curl或者wget方式安装nvm：

   ```shell
   $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
   ```

   ```shell
   $ wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
   ```

   Windows安装在[这里](https://github.com/coreybutler/nvm-windows/releases)，下载安装包进行安装。

2. 安装完成后，输入`nvm --version`查看当前安装版本：

   ```shell
   $ nvm --version
   ```

   ![](https://figure-b.ricardolsw.com/image/9UwS4Fm4Gv9VmCWd9QvJHKyNO50lll4P.jpg?x-oss-process=style/watermark)

3. 使用nvm安装Node.js：

   ```shell
   $ nvm install 10.19.0 	#安装指定版本Node.js(v10.19.0)
   ```

4. 安装完成后使用`nvm ls`查看当前安装的Node.js列表（我这里还安装了v8.12.0和v13.13.0两个版本）：

   ```shell
   $ nvm ls
   ```

   ![](https://figure-b.ricardolsw.com/image/GSOSrnahPh8NoujpCnYXLNgneL55Rzsd.jpg?x-oss-process=style/watermark)

   > 上面第四行：default -> 10 (-> v10.19.0) 表示当前所使用的默认版本是v10.19.0
   >
   > 使用`nvm alias default <version>`指定全局默认的Node.js版本，使用`nvm use <version>`将Node.js切换至指定版本。
   >
   > **注意**：`nvm use <version>`所设置的版本只在**当前命令行环境**生效

5. Node.js安装完成后，使用`node -v`可以查看当前所使用的Node.js版本：

   ```shell
   $ node -v
   ```

   ![](https://figure-b.ricardolsw.com/image/KmYCYrAhxgJRk85nIykYJzVrhjLYe8Qa.jpg?x-oss-process=style/watermark)

### 2.安装cnpm（可选）

安装好Node.js之后，它会自带一个叫[npm](https://www.npmjs.com/)的东西，它是随同Node.js一起安装的包管理工具。它允许用户从npm服务器下载他人编写的第三方包到本地使用，也可以上传自己编写的第三方包到npm服务器上面以供别人使用。

可以使用`npm -v`来查看当前Node.js所自带的npm版本：

```shell
$ npm -v
```

![](https://figure-b.ricardolsw.com/image/brxhU5ZnxMw0bhqB4dshWAudwGM1dSkT.jpg?x-oss-process=style/watermark)

由于npm服务器在国外，有时候下载依赖包的时候会很慢甚至超时导致下载失败。如果碰到这种情况我们可以安装[cnpm](https://developer.aliyun.com/mirror/NPM?from=tnpm)（淘宝npm镜像），它是一个完整的`npmjs.org`镜像，每10分钟同步一次。

1. 使用npm命令安装cnpm：

   ```shell
   $ npm install -g cnpm --registry=https://registry.npm.taobao.org
   ```

2. 安装完成后，使用`cnpm -v`查看当前cnpm版本：

   ```shell
   $ cnpm -v
   ```

   ![](https://figure-b.ricardolsw.com/image/053leawrdSEXCOA1C1p4cPLwyphge8GR.jpg?x-oss-process=style/watermark)

   > 这时候我们就可以使用cnpm来替代npm下载依赖包了

### 3.安装Vue CLI

[Vue CLI](https://cli.vuejs.org/zh/)是一个基于Vue.js进行快速开发的完整系统，它可以快速搭建一个项目脚手架，基于webpack构建，支持插件，并且提供图形化界面来管理Vue.js项目。

> Node版本要求：Vue CLI需要Node.js8.0或更高版本。

1. 使用npm或cnpm安装：

   ```shell
   $ npm install -g @vue/cli
   ```

   ```shell
   $ cnpm install -g @vue/cli
   ```

2. 安装完成后，使用`vue --version`查看当前版本：

   ```shell
   $ vue --version
   ```

   ![](https://figure-b.ricardolsw.com/image/UCA2F8hhmYw7jbayyoh9lPutBLH17o2d.jpg?x-oss-process=style/watermark)

## 写在最后

到这里，运行Vue项目所需要的前端环境已经搭建完毕。下一篇将介绍如何使用Vue CLI快速搭建一个项目脚手架。

我慢慢的写，你们慢慢的看~

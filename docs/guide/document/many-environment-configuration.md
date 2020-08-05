# 多环境配置

在实际项目中，我们开发完成后，需要将项目打包部署到服务器上，一般服务器本地环境、dev环境、uat环境、生产环境，如果每次部署都要修改配置就会很麻烦，而Vue CLI提供了一套环境变量和模式。

## 环境变量与模式

可以在项目根目录下新建以下几种配置文件：

```sh
.env                # 在所有的环境中被载入
.env.local          # 在所有的环境中被载入，但会被 git 忽略
.env.[mode]         # 只在指定的模式中被载入
.env.[mode].local   # 只在指定的模式中被载入，但会被 git 忽略
```

一个环境文件只包含环境变量的“键=值”对：

```
FOO=bar
VUE_APP_SECRET=secret
```

被载入的变量将会对 `vue-cli-service` 的所有命令、插件和依赖可用。

::: tip 环境加载属性

为一个特定模式准备的环境文件 (例如 `.env.production`) 将会比一般的环境文件 (例如 `.env`) 拥有更高的优先级。

此外，Vue CLI 启动时已经存在的环境变量拥有最高优先级，并不会被 `.env` 文件覆写。

:::

## 模式

**模式**是Vue CLI项目中一个重要的概念。默认情况下，一个Vue CLI项目有三个模式：

- `development`模式用于 `vue-cli-service serve`
- `production` 模式用于 `vue-cli-service build` 和 `vue-cli-service test:e2e`
- `test` 模式用于 `vue-cli-service test:unit`

注意模式不同于 `NODE_ENV`，一个模式可以包含多个环境变量。也就是说，每个模式都会将 `NODE_ENV` 的值设置为模式的名称——比如在 development 模式下 `NODE_ENV` 的值会被设置为 `"development"`。

你可以通过为 `.env` 文件增加后缀来设置某个模式下特有的环境变量。比如，如果你在项目根目录创建一个名为 `.env.development` 的文件，那么在这个文件里声明过的变量就只会在 development 模式下被载入。

你可以通过传递 `--mode` 选项参数为命令行覆写默认的模式。例如，如果你想要在构建命令中使用开发环境变量，请在你的 `package.json` 脚本中加入：

```
"dev-build": "vue-cli-service build --mode development",
```

## 在项目中配置

在创建的项目中已经生成好了三个配置文件`.env`、`.env.development`、`.env.preview`：

![image-20200805224531335](https://figure-b.ricardolsw.com/image/image-20200805224531335.png)

.env：

```
NODE_ENV=production
VUE_APP_PREVIEW=false
VUE_APP_API_BASE_URL=/api
```

.env.development：

```
NODE_ENV=development
VUE_APP_PREVIEW=true
VUE_APP_API_BASE_URL=/api
```

.env.preview：

```
NODE_ENV=production
VUE_APP_PREVIEW=true
VUE_APP_API_BASE_URL=/api
```

这里.env.development是本地开发环境配置文件，.env是生产环境配置文件，.env.preview是测试环境配置文件，在package.json里scripts属性配置如下：

```json
"scripts": {
  "serve": "vue-cli-service serve", // 使用.env.development
  "build": "vue-cli-service build", // 使用.env
  "build:preview": "vue-cli-service build --mode preview", // 使用 .env.preview
},
```

## 在代码中使用环境变量

只有以 `VUE_APP_` 开头的变量会被 `webpack.DefinePlugin` 静态嵌入到客户端侧的包中。你可以在应用的代码中这样访问它们：

例如打印上面的VUE_APP_PREVIEW

```javascript
console.log(process.env.VUE_APP_PREVIEW)
```

在构建过程中，`process.env.VUE_APP_PREVIEW`将会被相应的值所取代。在`VUE_APP_PREVIEW=false`的情况下，它会被替换为`"false"`。

除了 `VUE_APP_*` 变量之外，在你的应用代码中始终可用的还有两个特殊的变量：

- `NODE_ENV` - 会是 `"development"`、`"production"` 或 `"test"` 中的一个。具体的值取决于应用运行的模式。
- `BASE_URL` - 会和 `vue.config.js` 中的 `publicPath` 选项相符，即你的应用会部署到的基础路径。

## 只在本地有效的变量

有的时候你可能有一些不应该提交到代码仓库中的变量，尤其是当你的项目托管在公共仓库时。这种情况下你应该使用一个 `.env.local` 文件取而代之。本地环境文件默认会被忽略，且出现在 `.gitignore` 中。

`.local` 也可以加在指定模式的环境文件上，比如 `.env.development.local` 将会在 development 模式下被载入，且被 git 忽略。
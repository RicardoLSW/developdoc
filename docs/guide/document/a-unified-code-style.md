# 统一代码风格

## 前言

代码规范是程序员的根本，入门第一步，从规范代码开始，而ESLint就是一款检查JavaScript代码风格/错误的工具，其他类似的还有TSLint、stylelint。

ESLint包含三个功能：

- 检查语法
- 发现错误
- 格式化代码

而下面介绍的Prettier就只有格式化代码这个功能。Perttier只是一个代码格式化工具，只负责格式化代码。那么为什么要把ESLint的格式化代码交给Perttier来做呢？

1. 更好更先进的代码规范
2. 支持更多的语言

## 安装依赖

```shell
$ yarn add -D eslint-config-prettier eslint-plugin-prettier prettier
```

## 修改配置文件

在`.eslintr.js`中的`extends`属性里使用prettier插件：

```json
module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/strongly-recommended',
    '@vue/standard',
    'plugin:prettier/recommended', // 这里使用prettier插件
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'generator-star-spacing': 'off',
    'no-mixed-operators': 0,
    'vue/max-attributes-per-line': [
      5,
      {
        'singleline': 5,
        'multiline': {
          'max': 1,
          'allowFirstLine': false
        }
      }
    ],
    'vue/attribute-hyphenation': 0,
    'vue/html-self-closing': 0,
    'vue/component-name-in-template-casing': 0,
    'vue/html-closing-bracket-spacing': 0,
    'vue/singleline-html-element-content-newline': 0,
    'vue/no-unused-components': 0,
    'vue/multiline-html-element-content-newline': 0,
    'vue/no-use-v-if-with-v-for': 0,
    'vue/html-closing-bracket-newline': 0,
    'vue/no-parsing-error': 0,
    'no-tabs': 0,
    'quotes': [
      2,
      'single',
      {
        'avoidEscape': true,
        'allowTemplateLiterals': true
      }
    ],
    'semi': [
      2,
      'never',
      {
        'beforeStatementContinuationChars': 'never'
      }
    ],
    'no-delete-var': 2,
    'prefer-const': [
      2,
      {
        'ignoreReadBeforeAssign': false
      }
    ],
    'template-curly-spacing': 'off',
    'indent': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
```

## 与VSCode集成

1. 在VSCode的扩展商店中下载一下两个插件：

   - ESLint
   - Prettier

   ![](https://figure-b.ricardolsw.com/image/23SANtWn82XsNvTrkGTLSZNEPFecSvT3.jpg?x-oss-process=style/watermark)

   ![](https://figure-b.ricardolsw.com/image/CU88wfXV1TDU4CQiVPCXU22v8D7q6nB3.jpg?x-oss-process=style/watermark)

2. 下载安装好之后，按alt+shift+F格式化代码，顶部会弹出一个窗口让你为Vue文件选择默认的格式化程序，这里我们选择Prettier - Code formatter，使用Prettier来格式化代码：

   ![](https://figure-b.ricardolsw.com/image/1sTPSqaFAkFRMdhcukSRdrWK35gM1D6h.jpg?x-oss-process=style/watermark)

3. 修改VSCode的settings.json文件，让VSCode能够在保存的时候自动格式化代码：

   ```json
   "editor.codeActionsOnSave": {
     "source.fixAll": true
   }
   ```

## 与Webstorm集成

1. 在设置→插件里面下载Prettier：

   ![](https://figure-b.ricardolsw.com/image/xq6xCHwEYIqq79wIWp1pIfn8aWaAnghf.jpg?x-oss-process=style/watermark)

2. 然后还是在设置里面

   - Languages & Frameworks → JavaScript → Prettier，Prettier package选择项目中的Prettier：

     ![](https://figure-b.ricardolsw.com/image/bsFOF4Rbqy1E93sVCrLIfGMuDllS9Uef.jpg?x-oss-process=style/watermark)

   - Tools→File Watchers里面点击左下角加号选择Prettier：

     ![](https://figure-b.ricardolsw.com/image/M9FKAxnZL6WvrCgog5wcstOVZR4gDFVn.jpg?x-oss-process=style/watermark)

   - File Type选择Any，其他默认即可：

     ![](https://figure-b.ricardolsw.com/image/KFNEeUd0SXFB9oY8J1ewiqbGxL6z0Wph.jpg?x-oss-process=style/watermark)

   - 最后点击Apply，OK

## 使用

我们可以手动使用编辑器的快捷键来格式化代码，也可以通过保存操作来自动格式化代码。

## 写在最后

有了prettier我们保存后就能自动格式化代码，也不用为了项目代码不统一和同事争论得面红耳赤，因为我们统一使用prettier的风格。可能刚开始有些地方你看不惯，不过不要紧，想想这么做都是为了团队和睦，世界和平，我们做出的牺牲都是必要的。而且prettier的样式风格已经在很多大型开源项目中被采用，比如vue、react、webpack、babel。

# 收据开具页面

本节知识点：

- 组件封装
- VueX
- 表单校验

## 创建收据开具相关Mock

创建`src/mock/services/common.js`公共mock：

```javascript
import Mock from 'mockjs2'
import { builder, getQueryParameters } from '../util'

// 值列表
const lookupValue = (options) => {
  const parameters = getQueryParameters(options)

  switch (parameters.type) {
    // 收据类型
    case 'FIN_PAY_RECEIPT_TYPE':
      return builder(
        JSON.parse(
          '[{"receiptType":"STORAGE","receiptTypeMeaning":"仓储费"},{"receiptType":"PREPAID","receiptTypeMeaning":"预付款"},{"receiptType":"PICK","receiptTypeMeaning":"梯货款"},{"receiptType":"CARRY","receiptTypeMeaning":"搬运设备"},{"receiptType":"UNQUALIFIED","receiptTypeMeaning":"不合格品赔偿"},{"receiptType":"STAFF","receiptTypeMeaning":"员工付款"},{"receiptType":"FINE","receiptTypeMeaning":"罚款"},{"receiptType":"CUSTOMER_MEAL","receiptTypeMeaning":"客饭费"},{"receiptType":"CERTIFICATE","receiptTypeMeaning":"补合格证"},{"receiptType":"OTHER","receiptTypeMeaning":"其他"}]'
        )
      )
    // 付款方式
    case 'FIN_PAY_RECEIPT_PAY_TYPE':
      return builder(
        JSON.parse(
          '[{"payType":"WEIXIN","payTypeMeaning":"微信支付"},{"payType":"CASH","payTypeMeaning":"现金支付"},{"payType":"BANK","payTypeMeaning":"银行转账"}]'
        )
      )
    default:
      return null
  }
}

Mock.mock(/\/lookup-values/, 'get', lookupValue)
```

创建`src/mock/services/receipt.js`收据相关mock：

```javascript
import Mock from 'mockjs2'
import { builder } from '../util'

// 获取收据编号
const getOrderNo = () => {
  return builder({
    receiptNo: Mock.mock('@integer(100000000, 999999999)'),
  })
}

Mock.mock(/\/order-no/, 'get', getOrderNo)
```

同样，在src/mock/index.js引入这两个mock：

```javascript
import { isIE } from '@/utils/util'

// 判断环境不是 prod 或者 preview 是 true 时，加载 mock 服务
if (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true') {
  if (isIE()) {
    console.error('[antd-pro] ERROR: `mockjs` NOT SUPPORT `IE` PLEASE DO NOT USE IN `production` ENV.')
  }
  // 使用同步加载依赖
  // 防止 vuex 中的 GetInfo 早于 mock 运行，导致无法 mock 请求返回结果
  console.log('[antd-pro] mock mounting')
  const Mock = require('mockjs2')
  require('./services/auth')
  require('./services/user')
  require('./services/manage')
  require('./services/other')
  require('./services/tagCloud')
  require('./services/article')
  require('./services/workSpace') // 引入工作台Mock
  require('./services/common') // 公共mock
  require('./services/receipt') // 收据相关mock

  Mock.setup({
    timeout: 800, // setter delay time
  })
  console.log('[antd-pro] mock mounted')
}
```

## 使用VueX管理收据信息

在`src/stor/modules`目录下新建receipt.js文件：

```javascript
const receipt = {
  state: {
    receiptIssuedForm: {},
  },

  mutations: {
    SET_RECEIPT_ISSUED_FORM: (state, receiptIssuedForm) => {
      state.receiptIssuedForm = receiptIssuedForm
    },
  },

  actions: {
    setReceiptIssuedForm({ commit }, receiptIssuedForm) {
      commit('SET_RECEIPT_ISSUED_FORM', receiptIssuedForm)
    },
  },
}

export default receipt
```

然后在`src/store/index.js`引入：

```javascript
import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'

// default router permission control
import permission from './modules/permission'

import receipt from '@/store/modules/receipt'

// dynamic router permission control (Experimental)
// import permission from './modules/async-router'
import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    user,
    permission,
    receipt, // 引入receipt
  },
  state: {},
  mutations: {},
  actions: {},
  getters,
})
```

在`src/store/getter.js`新增一条getter：

```javascript
const getters = {
  isMobile: (state) => state.app.isMobile,
  lang: (state) => state.app.lang,
  theme: (state) => state.app.theme,
  color: (state) => state.app.color,
  token: (state) => state.user.token,
  avatar: (state) => state.user.avatar,
  nickname: (state) => state.user.name,
  welcome: (state) => state.user.welcome,
  roles: (state) => state.user.roles,
  userInfo: (state) => state.user.info,
  addRouters: (state) => state.permission.addRouters,
  multiTab: (state) => state.app.multiTab,
  receiptIssuedForm: (state) => state.receipt.receiptIssuedForm, // 新增的getter
}

export default getters
```

## 公共组件：结果页

我们封装一个公共组件，用于展示成功、失败页面。

在src/components目录下新建Result目录，在Result目录下新建Result.vue和index.js，分别写入以下内容：

Result.vue

```vue
<template>
  <div class="result">
    <div>
      <a-icon :class="{ icon: true, [`${type}`]: true }" :type="localIsSuccess ? 'check-circle' : 'close-circle'" />
    </div>
    <div class="title">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div class="description">
      <slot name="description">
        {{ description }}
      </slot>
    </div>
    <div class="extra" v-if="$slots.default">
      <slot></slot>
    </div>
    <div class="action" v-if="$slots.action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script>
const resultEnum = ['success', 'error']

export default {
  name: 'Result',
  props: {
    /** @Deprecated */
    isSuccess: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: resultEnum[0],
      validator(val) {
        return (val) => resultEnum.includes(val)
      },
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  computed: {
    localIsSuccess: function () {
      return this.type === resultEnum[0]
    },
  },
}
</script>

<style lang="less" scoped>
.result {
  text-align: center;
  width: 72%;
  margin: 0 auto;
  padding: 24px 0 8px;

  .icon {
    font-size: 72px;
    line-height: 72px;
    margin-bottom: 24px;
  }
  .success {
    color: #52c41a;
  }
  .error {
    color: red;
  }
  .title {
    font-size: 24px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    line-height: 32px;
    margin-bottom: 16px;
  }
  .description {
    font-size: 14px;
    line-height: 22px;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 24px;
  }
  .extra {
    background: #fafafa;
    padding: 24px 40px;
    border-radius: 2px;
    text-align: left;
  }
  .action {
    margin-top: 32px;
  }
}

.mobile {
  .result {
    width: 100%;
    margin: 0 auto;
    padding: unset;
  }
}
</style>
```

index.js

```javascript
import Result from './Result.vue'
export default Result
```

最后在src/components/index.js引入这个组件：

```javascript
import Result from '@/components/Result'

export {
  ...
  Result
}
```

## 创建收据开具页面

在src/views目录下新建receiptIssu目录，目录内容如下：

![image-20200820145248910](https://figure-b.ricardolsw.com/image/image-20200820145248910.png)

ReceiptIssu.vue

```vue
<template>
  <div>
    <a-card :bordered="false" v-if="result === 'none'">
      <a-steps class="steps" :current="currentTab">
        <a-step title="选择收据类型" />
        <a-step title="填写收据信息" />
        <a-step title="开具完成" />
      </a-steps>
      <div>
        <step1 v-if="currentTab === 0" @nextStep="nextStep" />
        <step2 v-if="currentTab === 1" @nextStep="nextStep" @prevStep="prevStep" />
        <step3 v-if="currentTab === 2" @prevStep="prevStep" @finish="finish" />
      </div>
    </a-card>
    <a-card :bordered="false" v-else-if="result === 'success' || result === 'error'">
      <result :type="result" :description="description" :title="title">
        <template slot="action">
          <a-button style="margin-left: 8px;" v-if="result === 'success'" @click="toPage('receiptIssued')"
            >继续开具</a-button
          >
          <a-button style="margin-left: 8px;" v-else-if="result === 'error'" @click="toPage('receiptIssued')"
            >重新开具</a-button
          >
        </template>
      </result>
    </a-card>
  </div>
</template>

<script>
import step1 from './component/Step1'
import step2 from './component/Step2'
import step3 from './component/Step3'
import { Result } from '@/components'
export default {
  name: 'ReceiptIssu',
  components: {
    step1,
    step2,
    step3,
    Result,
  },
  data() {
    return {
      currentTab: 0,
      result: 'none',
      title: '',
      description: '',
    }
  },
  methods: {
    nextStep() {
      if (this.currentTab < 2) {
        this.currentTab += 1
      }
    },
    prevStep() {
      if (this.currentTab > 0) {
        this.currentTab -= 1
      }
    },
    finish(value) {
      this.title = `开具${value === 'success' ? '成功' : value === 'error' ? '失败' : ''}`
      this.result = value
      this.currentTab = 0
    },
    toPage(value) {
      if (value === 'receiptIssued') {
        this.result = 'none'
      } else if (value === 'receiptManagement') {
        this.$router.push({ name: value })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.steps {
  max-width: 750px;
  margin: 16px auto;
}
</style>
```



Step1.vue

```vue
<template>
  <a-form
    :form="form"
    style="max-width: 500px; margin: 40px auto 0; height: 500px; justify-content: space-between; align-items: center;"
    class="flex-column"
  >
    <div style="width: 100%;">
      <a-form-item label="收据类型" :labelCol="labelCol" :wrapperCol="wrapperCol" required style="width: 100%;">
        <a-select
          placeholder="请选择收据类型"
          v-decorator="['receiptType', { rules: [{ required: true, message: '请选择收据类型' }] }]"
        >
          <a-select-option v-for="(item, index) in receiptTypeList" :value="item.receiptType" :key="index">{{
            item.receiptTypeMeaning
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="支付方式" :labelCol="labelCol" :wrapperCol="wrapperCol" required style="width: 100%;">
        <a-select
          placeholder="请选择支付方式"
          v-decorator="['payType', { rules: [{ required: true, message: '请选择支付方式' }] }]"
        >
          <a-select-option v-for="(item, index) in payTypeList" :value="item.payType" :key="index">{{
            item.payTypeMeaning
          }}</a-select-option>
        </a-select>
      </a-form-item>
    </div>
    <a-form-item style="width: 100%; display: flex; justify-content: center;">
      <a-button type="primary" @click="nextStep">下一步</a-button>
    </a-form-item>
  </a-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { isEmpty } from '@/utils/util'
import pick from 'lodash.pick'
import { keyValueList } from '@/api/api'

export default {
  name: 'Step1',
  data() {
    return {
      labelCol: { lg: { span: 5 }, sm: { span: 5 } },
      wrapperCol: { lg: { span: 19 }, sm: { span: 19 } },
      form: this.$form.createForm(this),
      receiptTypeList: [], // 收据类型
      payTypeList: [], // 支付方式
    }
  },
  mounted() {
    setTimeout(async () => {
      const {
        form: { setFieldsValue },
        receiptIssuedForm,
      } = this
      await keyValueList({ type: 'FIN_PAY_RECEIPT_TYPE' }).then((res) => (this.receiptTypeList = res.result))
      await keyValueList({ type: 'FIN_PAY_RECEIPT_PAY_TYPE' }).then((res) => (this.payTypeList = res.result))
      if (!isEmpty(receiptIssuedForm().step1)) {
        await setFieldsValue(pick(receiptIssuedForm().step1, ['receiptType', 'payType']))
      }
    }, 0)
  },
  methods: {
    ...mapActions(['setReceiptIssuedForm']),
    ...mapGetters(['receiptIssuedForm']),
    nextStep() {
      const {
        form: { validateFields },
        setReceiptIssuedForm,
        receiptIssuedForm,
      } = this
      // 先校验，通过表单校验后，才进入下一步
      validateFields((err, values) => {
        if (!err) {
          setReceiptIssuedForm(
            Object.assign(receiptIssuedForm(), {
              step1: Object.assign(
                this.receiptTypeList.filter((e) => e.receiptType === values.receiptType)[0],
                this.payTypeList.filter((e) => e.payType === values.payType)[0]
              ),
            })
          )
          this.$emit('nextStep')
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped></style>
```



Step2.vue

```vue
<template>
  <div
    class="flex-column"
    style="max-width: 500px; margin: 40px auto 0; height: 500px; justify-content: space-between;"
  >
    <a-form :form="form" v-if="type === 0">
      <a-form-item label="付款单位" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input
          placeholder="请输入付款单位"
          v-decorator="['payer', { rules: [{ required: true, message: '请输入付款单位' }] }]"
        />
      </a-form-item>
      <a-form-item label="收据描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-textarea
          placeholder="请输入收据的相关描述"
          :rows="4"
          v-decorator="['receiptDesc', { rules: [{ message: '请输入收据的相关描述' }] }]"
        />
      </a-form-item>
      <a-form-item label="收据金额" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input-number
          placeholder="请输入金额"
          style="width: 100%;"
          :precision="2"
          :step="0.01"
          :min="0"
          v-decorator="['receiptMoney', { rules: [{ required: true, message: '请输入金额' }] }]"
        />
      </a-form-item>
      <a-form-item label="合同号" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input
          placeholder="请输入合同号"
          v-decorator="['contractNo', { rules: [{ required: true, message: '请输入合同号' }] }]"
        />
      </a-form-item>
      <a-form-item label="发票号" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input
          placeholder="请输入发票号"
          v-decorator="['invoiceNo', { rules: [{ required: true, message: 'invoiceNo' }] }]"
        />
      </a-form-item>
    </a-form>
    <a-form :form="form" v-if="type === 1">
      <a-form-item label="付款单位" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input
          placeholder="请输入付款单位"
          v-decorator="['payer', { rules: [{ required: true, message: '请输入付款单位' }] }]"
        />
      </a-form-item>
      <a-form-item label="收据描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-textarea
          placeholder="请输入收据的相关描述"
          :rows="4"
          v-decorator="['receiptDesc', { rules: [{ message: '请输入收据的相关描述' }] }]"
        />
      </a-form-item>
      <a-form-item label="收据金额" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input-number
          placeholder="请输入金额"
          style="width: 100%;"
          :precision="2"
          :step="0.01"
          :min="0"
          v-decorator="['receiptMoney', { rules: [{ required: true, message: '请输入金额' }] }]"
        />
      </a-form-item>
      <a-form-item label="客户号" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input
          placeholder="请输入客户号"
          v-decorator="['customerNo', { rules: [{ required: true, message: '请输入客户号' }] }]"
        />
      </a-form-item>
    </a-form>
    <a-form :form="form" v-if="type === 2">
      <a-form-item label="付款单位" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input
          placeholder="请输入付款单位"
          v-decorator="['payer', { rules: [{ required: true, message: '请输入付款单位' }] }]"
        />
      </a-form-item>
      <a-form-item label="收据描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-textarea
          placeholder="请输入收据的相关描述"
          :rows="4"
          v-decorator="['receiptDesc', { rules: [{ message: '请输入收据的相关描述' }] }]"
        />
      </a-form-item>
      <a-form-item label="收据金额" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input-number
          placeholder="请输入金额"
          style="width: 100%;"
          :precision="2"
          :step="0.01"
          :min="0"
          v-decorator="['receiptMoney', { rules: [{ required: true, message: '请输入金额' }] }]"
        />
      </a-form-item>
      <a-form-item label="发票号" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-input
          placeholder="请输入发票号"
          v-decorator="['invoiceNo', { rules: [{ required: true, message: '请输入发票号' }] }]"
        />
      </a-form-item>
    </a-form>
    <a-form :form="form" v-if="type === 3">
      <a-form-item label="付款单位" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input
          placeholder="请输入付款单位"
          v-decorator="['payer', { rules: [{ required: true, message: '请输入付款单位' }] }]"
        />
      </a-form-item>
      <a-form-item label="收据描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-textarea
          placeholder="请输入收据的相关描述"
          :rows="4"
          v-decorator="['receiptDesc', { rules: [{ message: '请输入收据的相关描述' }] }]"
        />
      </a-form-item>
      <a-form-item label="收据金额" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input-number
          placeholder="请输入金额"
          style="width: 100%;"
          :precision="2"
          :step="0.01"
          :min="0"
          v-decorator="['receiptMoney', { rules: [{ required: true, message: '请输入金额' }] }]"
        />
      </a-form-item>
    </a-form>
    <a-form :form="form" v-if="type === 4">
      <a-form-item label="实收编号" :labelCol="labelCol" :wrapperCol="wrapperCol" required v-if="paidNoRequired">
        <a-input
          placeholder="请输入实收编号"
          v-decorator="['paidNo', { rules: [{ required: true, message: '请输入实收编号' }] }]"
        />
        <a-checkbox
          @change="onChange"
          style="position: absolute; width: 150px; margin-left: 10px; color: #ff4d4f;"
          :checked="!paidNoRequired"
        >
          暂无实收编号
        </a-checkbox>
      </a-form-item>
      <a-form-item label="实收编号" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="!paidNoRequired">
        <a-input
          placeholder="请输入实收编号"
          v-decorator="['paidNo', { rules: [{ message: '请输入实收编号' }] }]"
          disabled
        />
        <a-checkbox
          @change="onChange"
          style="position: absolute; width: 150px; margin-left: 10px; color: #ff4d4f;"
          :checked="!paidNoRequired"
        >
          暂无实收编号
        </a-checkbox>
      </a-form-item>
      <a-form-item label="付款单位" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input
          placeholder="请输入付款单位"
          v-decorator="['payer', { rules: [{ required: true, message: '请输入付款单位' }] }]"
          :disabled="isPaidNo"
        />
      </a-form-item>
      <a-form-item label="收据描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
        <a-textarea
          placeholder="请输入收据的相关描述"
          :rows="4"
          v-decorator="['receiptDesc', { rules: [{ message: '请输入收据的相关描述' }] }]"
        />
      </a-form-item>
      <a-form-item label="收据金额" :labelCol="labelCol" :wrapperCol="wrapperCol" required>
        <a-input-number
          placeholder="请输入金额"
          style="width: 100%;"
          :precision="2"
          :step="0.01"
          :min="0"
          v-decorator="['receiptMoney', { rules: [{ required: true, message: '请输入金额' }] }]"
          :disabled="isPaidNo"
        />
      </a-form-item>
    </a-form>
    <a-form-item style="width: 100%; display: flex; justify-content: center;">
      <a-button @click="prevStep" style="margin-right: 10px;">上一步</a-button>
      <a-button type="primary" @click="nextStep" style="margin-left: 10px;">下一步</a-button>
    </a-form-item>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { isEmpty } from '@/utils/util'
import pick from 'lodash.pick'
import { getOrderNo } from '@/api/api'
export default {
  name: 'Step2',
  data() {
    return {
      labelCol: { lg: { span: 5 }, sm: { span: 5 } },
      wrapperCol: { lg: { span: 19 }, sm: { span: 19 } },
      form: this.$form.createForm(this),
      type: null,
      paidNoRequired: true,
      isPaidNo: false,
    }
  },
  mounted() {
    const {
      form: { setFieldsValue },
      receiptIssuedForm,
    } = this
    if (!isEmpty(receiptIssuedForm().step1)) {
      if (receiptIssuedForm().step1.payType === 'BANK') {
        this.type = 4
        this.$nextTick(() => {
          if (!isEmpty(receiptIssuedForm().step2)) {
            this.paidNoRequired = receiptIssuedForm().step2.paidNoRequired
            this.isPaidNo = receiptIssuedForm().step2.isPaidNo
            setFieldsValue(pick(receiptIssuedForm().step2, ['payer', 'receiptDesc', 'receiptMoney', 'paidNo']))
          }
        })
      } else {
        // 根据不同收据类型，渲染相应的表单
        switch (receiptIssuedForm().step1.receiptType) {
          case 'STORAGE':
            this.type = 0
            this.$nextTick(() => {
              if (!isEmpty(receiptIssuedForm().step2)) {
                setFieldsValue(
                  pick(receiptIssuedForm().step2, ['payer', 'receiptDesc', 'receiptMoney', 'contractNo', 'invoiceNo'])
                )
              }
            })
            break
          case 'PREPAID':
          case 'PICK':
            this.type = 1
            this.$nextTick(() => {
              if (!isEmpty(receiptIssuedForm().step2)) {
                setFieldsValue(pick(receiptIssuedForm().step2, ['payer', 'receiptDesc', 'receiptMoney', 'customerNo']))
              }
            })
            break
          case 'CARRY':
          case 'UNQUALIFIED':
            this.type = 2
            this.$nextTick(() => {
              if (!isEmpty(receiptIssuedForm().step2)) {
                setFieldsValue(pick(receiptIssuedForm().step2, ['payer', 'receiptDesc', 'receiptMoney', 'invoiceNo']))
              }
            })
            break
          case 'STAFF':
          case 'FINE':
          case 'CUSTOMER_MEAL':
          case 'CERTIFICATE':
          case 'OTHER':
            this.type = 3
            this.$nextTick(() => {
              if (!isEmpty(receiptIssuedForm().step2)) {
                setFieldsValue(pick(receiptIssuedForm().step2, ['payer', 'receiptDesc', 'receiptMoney']))
              }
            })
            break
          default:
            break
        }
      }
    }
  },
  methods: {
    ...mapGetters(['receiptIssuedForm']),
    ...mapActions(['setReceiptIssuedForm']),
    /**
     * 上一步
     */
    prevStep() {
      this.$emit('prevStep')
    },
    /**
     * 下一步
     */
    nextStep() {
      const {
        form: { validateFields },
        setReceiptIssuedForm,
        receiptIssuedForm,
      } = this
      validateFields(async (err, values) => {
        if (!err) {
          let receiptNo = null
          if (!receiptIssuedForm()?.step2?.receiptNo) {
            receiptNo = await getOrderNo().then((res) => res.result.receiptNo)
          }
          await setReceiptIssuedForm(
            Object.assign(receiptIssuedForm(), {
              step2: Object.assign(
                {
                  receiptNo: receiptIssuedForm()?.step2?.receiptNo ? receiptIssuedForm()?.step2?.receiptNo : receiptNo,
                  paidNoRequired: this.paidNoRequired,
                  isPaidNo: this.isPaidNo,
                },
                pick(receiptIssuedForm().step1, 'receiptTypeMeaning', 'receiptType', 'payType', 'payTypeMeaning'),
                values
              ),
            })
          )
          this.$emit('nextStep')
        }
      })
    },
    onChange(e) {
      const {
        form: { setFieldsValue },
      } = this
      this.paidNoRequired = !e.target.checked
      if (e.target.checked) {
        setFieldsValue({
          paidNo: null,
        })
      }
    },
  },
}
</script>

<style scoped></style>
```



Step3.vue

```vue
<template>
  <div class="flex-column" style="padding: 20px; height: 500px; justify-content: space-between;">
    <div>
      <div class="flex-row" style="align-items: center;">
        <a-avatar shape="square" :size="16" :src="icon[0]" />
        <span
          style="
            color: rgba(0, 0, 0, 0.847058823529412);
            font-size: 16px;
            font-family: 'PingFangSC-Regular', 'PingFang SC';
            font-weight: 400;
            margin-left: 5px;
          "
          >收据信息</span
        >
      </div>
      <a-table
        :columns="columns"
        :data-source="tableData"
        bordered
        :pagination="false"
        :show-header="false"
        style="margin: 20px 0px;"
      >
        <template slot="name" slot-scope="text">
          <div>
            {{ text }}
          </div>
        </template>
        <template slot="value" slot-scope="text">
          <div>{{ text }}</div>
        </template>
      </a-table>
    </div>
    <a-form-item style="width: 100%; display: flex; justify-content: center;">
      <a-button @click="prevStep" style="margin-right: 10px;">上一步</a-button>
      <a-button type="primary" @click="finish" style="margin-left: 10px;" :loading="loading">完成收据开具</a-button>
    </a-form-item>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { isEmpty } from '@/utils/util'

export default {
  name: 'Step3',
  data() {
    return {
      icon: [require('@/assets/icons/u692.png')],
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
          width: 300,
          customCell: () => {
            return { style: 'background: rgba(250, 250, 250, 1);' }
          },
        },
        {
          title: 'Value',
          dataIndex: 'value',
          scopedSlots: { customRender: 'value' },
        },
      ],
      tableData: [],
      keyValue: [
        {
          key: 'receiptNo',
          value: '收据编号',
        },
        {
          key: 'receiptTypeMeaning',
          value: '收据类型',
        },
        {
          key: 'paidNo',
          value: '实收编号',
        },
        {
          key: 'payer',
          value: '付款单位',
        },
        {
          key: 'receiptDesc',
          value: '收据描述',
        },
        {
          key: 'receiptMoney',
          value: '收据金额',
        },
        {
          key: 'payTypeMeaning',
          value: '支付方式',
        },
        {
          key: 'contractNo',
          value: '合同号',
        },
        {
          key: 'invoiceNo',
          value: '发票号',
        },
        {
          key: 'customerNo',
          value: '客户号',
        },
      ],
      loading: false,
    }
  },
  mounted() {
    const { receiptIssuedForm } = this
    if (!isEmpty(receiptIssuedForm().step2) && !isEmpty(receiptIssuedForm().step1)) {
      this.keyValue.forEach((e, i) => {
        for (const key in receiptIssuedForm().step2) {
          if (e.key === key) {
            if (receiptIssuedForm().step2[key]) {
              this.tableData.push({
                key: i,
                name: this.keyValue.filter((e) => e.key === key)[0].value,
                value: receiptIssuedForm().step2[key],
              })
            }
          }
        }
      })
    }
  },
  methods: {
    ...mapGetters(['receiptIssuedForm']),
    ...mapActions(['setReceiptIssuedForm']),
    /**
     * 上一步
     */
    prevStep() {
      this.$emit('prevStep')
    },
    /**
     * 完成开具
     */
    finish() {
      this.loading = true
      const { setReceiptIssuedForm } = this
      setReceiptIssuedForm({})
      this.loading = false
      this.$emit('finish', 'success')
    },
  },
}
</script>

<style scoped></style>
```

## 添加到路由菜单

在src/config/router.config.js添加该页面：

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
        meta: { title: '工作台', icon: bxAnaalyse },
      },
      {
        path: 'receipt-issued',
        name: 'receiptIssued',
        component: () => import('@/views/receiptIssu/ReceiptIssu'),
        meta: { title: '收据开具', icon: bxAnaalyse },
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



## 页面效果

![1](https://figure-b.ricardolsw.com/image/1.png)

![2](https://figure-b.ricardolsw.com/image/2.png)

![3](https://figure-b.ricardolsw.com/image/3.png)

![4](https://figure-b.ricardolsw.com/image/4.png)


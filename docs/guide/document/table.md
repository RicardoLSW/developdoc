# 收据审核、查询、打印、收款表格页面

## 收据列表Mock

在src/mock/services/common.js里添加收据列表Mock：

```javascript
const finReceiptOrder = (options) => {
  const totalCount = 111
  const result = []
  const parameters = getQueryParameters(options)
  const pageSize = parseInt(parameters.pageSize)
  const pageNo = parseInt(parameters.pageNo)
  const totalPage = Math.ceil(totalCount / pageSize)
  const key = (pageNo - 1) * pageSize
  const next = (pageNo >= totalPage ? totalCount % pageSize : pageSize) + 1
  for (let i = 1; i < next; i++) {
    const tmpKey = key + i
    const payType = Mock.mock('@pick(["WEIXIN", "CASH"])')
    const payTypeMeaning = payType === 'WEIXIN' ? '微信支付' : '现金支付'
    const receiptTypeMeaning = Mock.mock(
      `@pick(${JSON.parse(
        '[{"receiptType":"STORAGE","receiptTypeMeaning":"仓储费"},{"receiptType":"PREPAID","receiptTypeMeaning":"预付款"},{"receiptType":"PICK","receiptTypeMeaning":"梯货款"},{"receiptType":"CARRY","receiptTypeMeaning":"搬运设备"},{"receiptType":"UNQUALIFIED","receiptTypeMeaning":"不合格品赔偿"},{"receiptType":"STAFF","receiptTypeMeaning":"员工付款"},{"receiptType":"FINE","receiptTypeMeaning":"罚款"},{"receiptType":"CUSTOMER_MEAL","receiptTypeMeaning":"客饭费"},{"receiptType":"CERTIFICATE","receiptTypeMeaning":"补合格证"},{"receiptType":"OTHER","receiptTypeMeaning":"其他"}]'
      ).map((e) => e.receiptTypeMeaning)})`
    )
    let receiptStatusMeaning = []
    if (parameters.queryType === 'TO_APPROVE' || parameters.queryType === 'TO_PAY') {
      receiptStatusMeaning = Mock.mock(
        `@pick(${JSON.parse(
          '[{"receiptStatus":"TO_APPROVE","receiptStatusMeaning":"待审核"},{"receiptStatus":"REJECTED","receiptStatusMeaning":"已退回"},{"receiptStatus":"CANCEL","receiptStatusMeaning":"已作废"},{"receiptStatus":"TO_PAY","receiptStatusMeaning":"待付款"},{"receiptStatus":"COMPLETED","receiptStatusMeaning":"已完成"},{"receiptStatus":"BOOKED","receiptStatusMeaning":"已记账"},{"receiptStatus":"NOT_TRANSFER","receiptStatusMeaning":"未转账"},{"receiptStatus":"TRANSFERRED","receiptStatusMeaning":"已转账"}]'
        )
          .filter((e) => e.receiptStatus === parameters.queryType)
          .map((e) => e.receiptStatusMeaning)})`
      )
    } else {
      receiptStatusMeaning = Mock.mock(
        `@pick(${JSON.parse(
          '[{"receiptStatus":"TO_APPROVE","receiptStatusMeaning":"待审核"},{"receiptStatus":"REJECTED","receiptStatusMeaning":"已退回"},{"receiptStatus":"CANCEL","receiptStatusMeaning":"已作废"},{"receiptStatus":"TO_PAY","receiptStatusMeaning":"待付款"},{"receiptStatus":"COMPLETED","receiptStatusMeaning":"已完成"},{"receiptStatus":"BOOKED","receiptStatusMeaning":"已记账"},{"receiptStatus":"NOT_TRANSFER","receiptStatusMeaning":"未转账"},{"receiptStatus":"TRANSFERRED","receiptStatusMeaning":"已转账"}]'
        ).map((e) => e.receiptStatusMeaning)})`
      )
    }
    result.push({
      id: tmpKey,
      key: tmpKey,
      receiptNo: Mock.mock('@integer(1000000000, 9999999999)'),
      receiptTypeMeaning,
      payTypeMeaning,
      receiptStatusMeaning,
      receiptMoney: Mock.mock('@integer(1000, 99999)'),
      payDate: Mock.mock('@date(yyyy-mm-dd)'),
      submitDate: Mock.mock('@date(yyyy-mm-dd)'),
      receiptStatus: Mock.mock('@csentence(5)'),
      payer: Mock.mock('@cname'),
      receiptSourceMeaning: Mock.mock('@csentence(5)'),
      payType,
    })
  }

  return builder({
    pageSize: pageSize,
    pageNo: pageNo,
    totalCount: totalCount,
    totalPage: totalPage,
    data: result,
  })
}

Mock.mock(/\/fin-receipt-order/, 'get', finReceiptOrder)
```

## api接口

在src/api/api.js新增以下接口：

```javascript
const getFinReceiptOrder = (params) => getAction('/fin-receipt-order', params) // 查询收据接口

esport { getFinReceiptOrder }
```



## 创建审核、查询、打印、收款表格页面

目录如下图：

![image-20200820164506982](https://figure-b.ricardolsw.com/image/image-20200820164506982.png)



### 审核页面：ReceiptAudit.vue

```vue
<script src="../../mock/services/common.js"></script>
<template>
  <div>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="收据编号">
                <a-input placeholder="" v-model="queryParam.receiptNo" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="收据类型">
                <a-select placeholder="" mode="multiple" v-model="receiptType" :allowClear="true">
                  <a-select-option v-for="(item, index) in receiptTypeList" :value="item.receiptType" :key="index">{{
                    item.receiptTypeMeaning
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="支付方式">
                <a-select placeholder="" v-model="queryParam.payType">
                  <a-select-option v-for="(item, index) in payTypeList" :value="item.payType" :key="index">{{
                    item.payTypeMeaning
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <span class="table-page-search-submitButtons" style="float: right; overflow: hidden;">
                <a-button
                  @click="
                    () => {
                      receiptType = []
                      queryParam.receiptNo = null
                      queryParam.receiptType = null
                      queryParam.payType = null
                      $refs.table.refresh(true)
                    }
                  "
                  >重置</a-button
                >
                <a-button type="primary" style="margin-left: 8px;" @click="$refs.table.refresh(true)">查询</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <a-card title="收据列表" style="margin-top: 24px;" :bordered="false">
      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        showPagination="auto"
        :alert="options.alert"
        :rowSelection="options.rowSelection"
      >
        <template slot="index" slot-scope="text, record, index">
          <span>{{ index + 1 + (queryParam.pageNo - 1) * queryParam.pageSize }}</span>
        </template>
        <span slot="receiptNo" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptTypeMeaning" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptMoney" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="payTypeMeaning" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="submitDate" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptStatusMeaning" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="payer" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptSourceMeaning" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="toPage(record)">查看详情</a>
            <a-divider type="vertical" />
            <a @click="audit(record)">审核</a>
          </template>
        </span>
      </s-table>
    </a-card>
    <a-modal title="收据审核" :visible="visible" @cancel="handleCancel">
      <a-form :form="form">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="审核备注"
          v-if="!(record.receiptStatus === 'NOT_TRANSFER')"
        >
          <a-textarea v-model="commentText" :rows="4" />
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="实收编号"
          v-if="record.receiptStatus === 'NOT_TRANSFER'"
        >
          <a-input
            placeholder="请输入实收编号"
            v-decorator="['paidNo', { rules: [{ required: true, message: '请输入实收编号' }] }]"
          />
        </a-form-item>
      </a-form>
      <template slot="footer">
        <a-button
          key="back"
          @click="handleReject"
          type="danger"
          ghost
          :loading="loading"
          v-if="!(record.receiptStatus === 'NOT_TRANSFER')"
        >
          退回
        </a-button>
        <a-button key="submit" type="primary" @click="handleApprove" :loading="loading">
          通过
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getFinReceiptOrder, keyValueList } from '@/api/api'
export default {
  name: 'ReceiptAudit',
  components: {
    STable,
    Ellipsis,
  },
  data() {
    return {
      receiptType: [],
      // 查询参数
      queryParam: {
        receiptNo: null, // 收据编号
        receiptType: null, // 收据类型
        payType: null, // 支付类型
        queryType: 'TO_APPROVE',
      },
      columns: [
        { title: '序号', dataIndex: 'index', width: 60, align: 'center', scopedSlots: { customRender: 'index' } },
        {
          title: '收据编号',
          dataIndex: 'receiptNo',
          scopedSlots: { customRender: 'receiptNo' },
        },
        {
          title: '收据类型',
          dataIndex: 'receiptTypeMeaning',
          scopedSlots: { customRender: 'receiptTypeMeaning' },
        },
        {
          title: '收据金额',
          dataIndex: 'receiptMoney',
          scopedSlots: { customRender: 'receiptMoney' },
        },
        {
          title: '付款方式',
          dataIndex: 'payTypeMeaning',
          scopedSlots: { customRender: 'payTypeMeaning' },
        },
        {
          title: '提交时间',
          dataIndex: 'submitDate',
          scopedSlots: { customRender: 'submitDate' },
        },
        {
          title: '收据状态',
          dataIndex: 'receiptStatusMeaning',
          scopedSlots: { customRender: 'receiptStatusMeaning' },
        },
        {
          title: '付款单位 ',
          dataIndex: 'payer',
          scopedSlots: { customRender: 'payer' },
        },
        {
          title: '收据来源',
          dataIndex: 'receiptSourceMeaning',
          scopedSlots: { customRender: 'receiptSourceMeaning' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 150,
          scopedSlots: { customRender: 'action' },
        },
      ],
      loadData: (parameter) => {
        this.queryParam.receiptType = this.receiptType.length ? this.receiptType.join(',') : null
        return getFinReceiptOrder(Object.assign(this.queryParam, parameter)).then((res) => {
          return {
            data: res.result.data,
            pageNo: parameter.pageNo,
            pageSize: parameter.pageSize,
            totalCount: res.result.totalCount,
          }
        })
      },
      receiptTypeList: [],
      receiptStatusList: [],
      options: {
        alert: {
          btnName: '批量审核',
          show: true,
          btnClick: () => {
            if (this.selectedRows.some((e) => e.receiptStatus === 'NOT_TRANSFER')) {
              this.$notification.warning({
                message: '警告',
                description: '银行转账类型的收据无法批量审核，请单独进行审核！',
              })
            } else {
              this.visible = true
            }
          },
        },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange,
        },
      },
      selectedRowKeys: [],
      selectedRows: [],
      visible: false,
      labelCol: { lg: { span: 5 }, sm: { span: 5 } },
      wrapperCol: { lg: { span: 19 }, sm: { span: 19 } },
      record: {},
      commentText: null,
      loading: false,
      payTypeList: [],
      form: this.$form.createForm(this),
    }
  },
  mounted() {
    keyValueList({ type: 'FIN_PAY_RECEIPT_TYPE' }).then((res) => (this.receiptTypeList = res.result))

    keyValueList({ type: 'FIN_PAY_RECEIPT_STATUS_CODE' }).then((res) => (this.receiptStatusList = res.result))

    keyValueList({ type: 'FIN_PAY_RECEIPT_PAY_TYPE' }).then((res) => (this.payTypeList = res.result))
  },
  methods: {
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleApprove() {
      const {
        form: { validateFields },
      } = this
      validateFields((err, values) => {
        if (!err) {
          this.$notification.success({
            message: '成功',
            description: '操作成功',
          })
          this.commentText = null
          this.$refs.table.refresh(true)
          this.visible = false
        }
      })
    },
    handleReject() {
      this.$notification.success({
        message: '成功',
        description: '操作成功',
      })
      this.commentText = null
      this.$refs.table.refresh(true)
      this.visible = false
    },
    handleCancel() {
      this.visible = false
    },
    audit(record) {
      this.record = record
      this.visible = true
    },
    toPage(record) {},
  },
}
</script>

<style scoped></style>
```

### 收款页面：ReceiptPayment.vue

```vue
<template>
  <div>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="收据编号">
                <a-input placeholder="" v-model="queryParam.receiptNo" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="收据类型">
                <a-select placeholder="" mode="multiple" v-model="receiptType" :allowClear="true">
                  <a-select-option v-for="(item, index) in receiptTypeList" :value="item.receiptType" :key="index">{{
                    item.receiptTypeMeaning
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="支付方式">
                <a-select placeholder="" v-model="queryParam.payType">
                  <a-select-option v-for="(item, index) in payTypeList" :value="item.payType" :key="index">{{
                    item.payTypeMeaning
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <span class="table-page-search-submitButtons" style="float: right; overflow: hidden;">
                <a-button
                  @click="
                    () => {
                      receiptType = []
                      queryParam.receiptNo = null
                      queryParam.receiptType = null
                      queryParam.payType = null
                      $refs.table.refresh(true)
                    }
                  "
                  >重置</a-button
                >
                <a-button type="primary" style="margin-left: 8px;" @click="$refs.table.refresh(true)">查询</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <a-card title="收据列表" style="margin-top: 24px;" :bordered="false">
      <s-table ref="table" size="default" rowKey="id" :columns="columns" :data="loadData" showPagination="auto">
        <template slot="index" slot-scope="text, record, index">
          <span>{{ index + 1 + (queryParam.pageNo - 1) * queryParam.pageSize }}</span>
        </template>
        <span slot="receiptNo" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptTypeMeaning" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptMoney" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="payTypeMeaning" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="submitDate" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptStatusMeaning" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="toPage(record)">查看详情</a>
            <a-divider type="vertical" />
            <a @click="newPage(record)">收据收款</a>
            <a-divider type="vertical" />
            <a-popconfirm title="确认作废？" ok-text="确认" cancel-text="取消" @confirm="confirm(record)">
              <a>作废收据</a>
            </a-popconfirm>
          </template>
        </span>
      </s-table>
    </a-card>
    <a-modal v-model="visible" title="选择微信支付方式" @ok="handleOk">
      <a-radio-group v-model="payType">
        <a-radio value="pay">
          扫码枪扫码付款
        </a-radio>
        <a-radio value="native-pay">
          扫描二维码付款
        </a-radio>
      </a-radio-group>
    </a-modal>
  </div>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getFinReceiptOrder, keyValueList } from '@/api/api'

export default {
  name: 'ReceiptPayment',
  components: {
    STable,
    Ellipsis,
  },
  data() {
    return {
      receiptType: [],
      // 查询参数
      queryParam: {
        receiptNo: null, // 收据编号
        receiptType: null, // 收据类型
        payType: null, // 支付方式
        queryType: 'TO_PAY',
      },
      columns: [
        { title: '序号', dataIndex: 'index', width: 60, align: 'center', scopedSlots: { customRender: 'index' } },
        {
          title: '收据编号',
          dataIndex: 'receiptNo',
          scopedSlots: { customRender: 'receiptNo' },
        },
        {
          title: '收据类型',
          dataIndex: 'receiptTypeMeaning',
          scopedSlots: { customRender: 'receiptTypeMeaning' },
        },
        {
          title: '收据金额',
          dataIndex: 'receiptMoney',
          scopedSlots: { customRender: 'receiptMoney' },
        },
        {
          title: '付款方式',
          dataIndex: 'payTypeMeaning',
          scopedSlots: { customRender: 'payTypeMeaning' },
        },
        {
          title: '提交时间',
          dataIndex: 'submitDate',
          scopedSlots: { customRender: 'submitDate' },
        },
        {
          title: '收据状态',
          dataIndex: 'receiptStatusMeaning',
          scopedSlots: { customRender: 'receiptStatusMeaning' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 300,
          scopedSlots: { customRender: 'action' },
        },
      ],
      loadData: (parameter) => {
        this.queryParam.receiptType = this.receiptType.length ? this.receiptType.join(',') : null
        return getFinReceiptOrder(Object.assign(this.queryParam, parameter)).then((res) => {
          return {
            data: res.result.data,
            pageNo: parameter.pageNo,
            pageSize: parameter.pageSize,
            totalCount: res.result.totalCount,
          }
        })
      },
      receiptTypeList: [],
      receiptStatusList: [],
      payTypeList: [],
      visible: false,
      payType: null,
      receiptInfo: null,
    }
  },
  mounted() {
    keyValueList({ type: 'FIN_PAY_RECEIPT_TYPE' }).then((res) => (this.receiptTypeList = res.result))

    keyValueList({ type: 'FIN_PAY_RECEIPT_STATUS_CODE' }).then((res) => (this.receiptStatusList = res.result))

    keyValueList({ type: 'FIN_PAY_RECEIPT_PAY_TYPE' }).then((res) => (this.payTypeList = res.result))
  },
  methods: {
    newPage(record) {
      const that = this
      if (record.payType === 'WEIXIN') {
        this.payType = 'pay'
        this.visible = true
        this.receiptInfo = record
      } else if (record.payType === 'CASH') {
        this.$confirm({
          title: '现金支付确认',
          content: '此收据为现金支付的支付方式，若已支付现金请点击确认操作，若现金仍为缴纳请取消确认。',
          onOk() {
            that.$notification.success({
              message: '成功',
              description: '操作成功',
            })
            that.$refs.table.refresh(true)
          },
          onCancel() {
            console.log('Cancel')
          },
        })
      }
    },
    toPage(record) {},
    confirm(record) {},
    handleOk() {
      this.visible = false
      const newPage = window.open(`/${this.payType}?receiptNo=${this.receiptInfo.receiptNo}`)
      const loop = setInterval(() => {
        if (newPage !== null && newPage.closed) {
          console.log('closed')
          this.$refs.table.refresh(true)
          clearInterval(loop)
        }
      }, 800)
    },
    onChange() {},
  },
}
</script>

<style scoped></style>
```

### 打印页面：ReceiptPrintList.vue

```vue
<template>
  <div>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="收据编号">
                <a-input placeholder="" v-model="queryParam.receiptNo" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="收据类型">
                <a-select placeholder="" mode="multiple" v-model="receiptType" :allowClear="true">
                  <a-select-option v-for="(item, index) in receiptTypeList" :value="item.receiptType" :key="index">{{
                    item.receiptTypeMeaning
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="支付方式">
                <a-select placeholder="" v-model="queryParam.payType">
                  <a-select-option v-for="(item, index) in payTypeList" :value="item.payType" :key="index">{{
                    item.payTypeMeaning
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <span class="table-page-search-submitButtons" style="float: right; overflow: hidden;">
                <a-button
                  @click="
                    () => {
                      receiptType = []
                      queryParam.receiptNo = null
                      queryParam.receiptType = null
                      queryParam.payType = null
                      $refs.table.refresh(true)
                    }
                  "
                  >重置</a-button
                >
                <a-button type="primary" style="margin-left: 8px;" @click="$refs.table.refresh(true)">查询</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <a-card title="收据列表" style="margin-top: 24px;" :bordered="false">
      <a-alert :showIcon="true" style="margin-bottom: 16px;">
        <template slot="message">
          <span style="margin-right: 12px;">
            已选择: <a style="font-weight: 600;">{{ this.selectedRows.length }}</a>
          </span>
          <a style="margin-left: 24px;" @click="btnClick">批量打印</a>
        </template>
      </a-alert>
      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        showPagination="auto"
        :rowSelection="options.rowSelection"
      >
        <template slot="index" slot-scope="text, record, index">
          <span>{{ index + 1 + (queryParam.pageNo - 1) * queryParam.pageSize }}</span>
        </template>
        <span slot="receiptNo" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptTypeMeaning" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptMoney" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="payTypeMeaning" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="submitDate" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="payer" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptStatusMeaning" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="toPage(record)" v-action:print>打印收据</a>
          </template>
        </span>
      </s-table>
    </a-card>
  </div>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getFinReceiptOrder, keyValueList } from '@/api/api'

export default {
  name: 'ReceiptPrintList',
  components: {
    STable,
    Ellipsis,
  },
  data() {
    return {
      receiptType: [],
      // 查询参数
      queryParam: {
        receiptNo: null, // 收据编号
        receiptType: null, // 收据类型
        receiptStatus: null, // 收据状态
        payType: null, // 支付方式
        queryType: 'PRINT',
      },
      columns: [
        { title: '序号', dataIndex: 'index', width: 60, align: 'center', scopedSlots: { customRender: 'index' } },
        {
          title: '收据编号',
          dataIndex: 'receiptNo',
          scopedSlots: { customRender: 'receiptNo' },
        },
        {
          title: '收据类型',
          dataIndex: 'receiptTypeMeaning',
          scopedSlots: { customRender: 'receiptTypeMeaning' },
        },
        {
          title: '收据金额',
          dataIndex: 'receiptMoney',
          scopedSlots: { customRender: 'receiptMoney' },
        },
        {
          title: '付款方式',
          dataIndex: 'payTypeMeaning',
          scopedSlots: { customRender: 'payTypeMeaning' },
        },
        {
          title: '提交时间',
          dataIndex: 'submitDate',
          scopedSlots: { customRender: 'submitDate' },
        },
        {
          title: '付款单位 ',
          dataIndex: 'payer',
          scopedSlots: { customRender: 'payer' },
        },
        {
          title: '收据状态',
          dataIndex: 'receiptStatusMeaning',
          scopedSlots: { customRender: 'receiptStatusMeaning' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 150,
          scopedSlots: { customRender: 'action' },
        },
      ],
      loadData: (parameter) => {
        this.queryParam.receiptType = this.receiptType.length ? this.receiptType.join(',') : null
        return getFinReceiptOrder(Object.assign(this.queryParam, parameter)).then((res) => {
          return {
            data: res.result.data,
            pageNo: parameter.pageNo,
            pageSize: parameter.pageSize,
            totalCount: res.result.totalCount,
          }
        })
      },
      receiptTypeList: [],
      receiptStatusList: [],
      payTypeList: [],
      options: {
        rowSelection: {
          onChange: this.onSelectChange,
        },
      },
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  mounted() {
    keyValueList({ type: 'FIN_PAY_RECEIPT_TYPE' }).then((res) => (this.receiptTypeList = res.result))

    keyValueList({ type: 'FIN_PAY_RECEIPT_STATUS_CODE' }).then((res) => (this.receiptStatusList = res.result))

    keyValueList({ type: 'FIN_PAY_RECEIPT_PAY_TYPE' }).then((res) => (this.payTypeList = res.result))
  },
  methods: {
    toPage(record) {
      this.$router.push({ name: 'receiptPrint', query: { receiptNo: record.receiptNo } })
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    btnClick() {
      if (this.selectedRows.length) {
        window.open(`/print?receiptNo=${this.selectedRows.map((e) => e.receiptNo).join('-')}`)
      } else {
        this.$notification.warning({
          message: '警告',
          description: '最少需要选择一条数据',
        })
      }
    },
  },
}
</script>

<style scoped></style>
```

### 查询页面：ReceiptTheQuery.vue

```vue
<template>
  <div>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="收据编号">
                <a-input placeholder="" v-model="queryParam.receiptNo" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="收据类型">
                <a-select placeholder="" mode="multiple" v-model="receiptType" :allowClear="true">
                  <a-select-option v-for="(item, index) in receiptTypeList" :value="item.receiptType" :key="index">{{
                    item.receiptTypeMeaning
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="收据状态">
                <a-select v-model="queryParam.receiptStatus">
                  <a-select-option
                    v-for="(item, index) in receiptStatusList"
                    :value="item.receiptStatus"
                    :key="index"
                    >{{ item.receiptStatusMeaning }}</a-select-option
                  >
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="支付方式">
                <a-select v-model="queryParam.payType">
                  <a-select-option v-for="(item, index) in payTypeList" :value="item.payType" :key="index">{{
                    item.payTypeMeaning
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="支付时间">
                <a-range-picker @change="onChange" style="width: 100%;" v-model="rangePicker" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons" style="float: right; overflow: hidden;">
                <a-button type="primary">导出</a-button>
                <a-button
                  style="margin-left: 8px;"
                  @click="
                    () => {
                      queryParam.receiptNo = null
                      queryParam.receiptStatus = null
                      receiptType = []
                      queryParam.receiptType = null
                      queryParam.payType = null
                      rangePicker = null
                      queryParam.startDate = null
                      queryParam.endDate = null
                      $refs.table.refresh(true)
                    }
                  "
                  >重置</a-button
                >
                <a-button type="primary" style="margin-left: 8px;" @click="$refs.table.refresh(true)">查询</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <a-card title="收据列表" style="margin-top: 24px;" :bordered="false">
      <a-alert :showIcon="true" style="margin-bottom: 16px;" v-action:tally>
        <template slot="message">
          <span style="margin-right: 12px;">
            已选择: <a style="font-weight: 600;">{{ this.selectedRows.length }}</a>
          </span>
          <a style="margin-left: 24px;" @click="btnClick">批量记账</a>
        </template>
      </a-alert>
      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        showPagination="auto"
        :rowSelection="options.rowSelection"
      >
        <template slot="index" slot-scope="text, record, index">
          <span>{{ index + 1 + (queryParam.pageNo - 1) * queryParam.pageSize }}</span>
        </template>
        <span slot="receiptNo" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptTypeMeaning" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptMoney" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="payTypeMeaning" slot-scope="text">
          <ellipsis :length="18" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="submitDate" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="payer" slot-scope="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="payDate" slot-scope="text">
          <ellipsis :length="24" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="receiptStatusMeaning" slot-scope="text, record">
          <ellipsis :length="24" tooltip :style="{ color: record.receiptStatus === 'BOOKED' ? '#52c41a' : '' }">{{
            text
          }}</ellipsis>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="toPage(record)">查看详情</a>
            <a-divider type="vertical" v-if="record.payType === 'BANK' && record.receiptStatus !== 'CANCEL'" />
            <a-popconfirm
              title="确认作废？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="confirm(record)"
              v-if="record.payType === 'BANK' && record.receiptStatus !== 'CANCEL'"
            >
              <a>作废收据</a>
            </a-popconfirm>
          </template>
        </span>
      </s-table>
    </a-card>
  </div>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { getFinReceiptOrder, keyValueList } from '@/api/api'
import moment from 'moment'

export default {
  name: 'ReceiptTheQuery',
  components: {
    STable,
    Ellipsis,
  },
  data() {
    return {
      receiptType: [],
      // 查询参数
      queryParam: {
        receiptNo: null, // 收据编号
        receiptType: null, // 收据类型
        receiptStatus: null, // 收据状态
        payType: null, // 支付方式
        startDate: null,
        endDate: null,
        queryType: 'QUERY',
      },
      columns: [
        { title: '序号', dataIndex: 'index', width: 60, align: 'center', scopedSlots: { customRender: 'index' } },
        {
          title: '收据编号',
          dataIndex: 'receiptNo',
          scopedSlots: { customRender: 'receiptNo' },
        },
        {
          title: '收据类型',
          dataIndex: 'receiptTypeMeaning',
          scopedSlots: { customRender: 'receiptTypeMeaning' },
        },
        {
          title: '收据金额',
          dataIndex: 'receiptMoney',
          scopedSlots: { customRender: 'receiptMoney' },
        },
        {
          title: '付款方式',
          dataIndex: 'payTypeMeaning',
          scopedSlots: { customRender: 'payTypeMeaning' },
        },
        {
          title: '提交时间',
          dataIndex: 'submitDate',
          scopedSlots: { customRender: 'submitDate' },
        },
        {
          title: '付款单位 ',
          dataIndex: 'payer',
          scopedSlots: { customRender: 'payer' },
        },
        {
          title: '支付时间 ',
          dataIndex: 'payDate',
          scopedSlots: { customRender: 'payDate' },
        },
        {
          title: '收据状态',
          dataIndex: 'receiptStatusMeaning',
          scopedSlots: { customRender: 'receiptStatusMeaning' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 170,
          scopedSlots: { customRender: 'action' },
        },
      ],
      loadData: (parameter) => {
        this.queryParam.receiptType = this.receiptType.length ? this.receiptType.join(',') : null
        return getFinReceiptOrder(Object.assign(this.queryParam, parameter)).then((res) => {
          return {
            data: res.result.data,
            pageNo: parameter.pageNo,
            pageSize: parameter.pageSize,
            totalCount: res.result.totalCount,
          }
        })
      },
      receiptTypeList: [], // 收据类型列表
      receiptStatusList: [], // 收据状态列表
      options: {
        rowSelection: {
          onChange: this.onSelectChange,
        },
      },
      selectedRowKeys: [],
      selectedRows: [],
      payTypeList: [], // 支付方式列表
      rangePicker: null,
    }
  },
  mounted() {
    keyValueList({ type: 'FIN_PAY_RECEIPT_TYPE' }).then((res) => (this.receiptTypeList = res.result))

    keyValueList({ type: 'FIN_PAY_RECEIPT_STATUS_CODE' }).then((res) => (this.receiptStatusList = res.result))

    keyValueList({ type: 'FIN_PAY_RECEIPT_PAY_TYPE' }).then((res) => (this.payTypeList = res.result))
  },
  methods: {
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toPage(record) {},
    btnClick() {},
    confirm(record) {},
    onChange(e) {
      if (e.length) {
        this.queryParam.startDate = moment(e[0]).format('YYYY-MM-DD')
        this.queryParam.endDate = moment(e[1]).format('YYYY-MM-DD')
      } else {
        this.queryParam.startDate = this.queryParam.endDate = null
      }
    },
  },
}
</script>

<style scoped></style>
```

## 添加路由菜单

在src/config/router/config.js里添加上面的页面：

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
      {
        path: 'receipt-collection',
        name: 'receiptCollection',
        component: () => import('@/views/receiptPayment/ReceiptPayment'),
        meta: { title: '收据收款', icon: bxAnaalyse },
      },
      {
        path: 'receipt-audit',
        name: 'receiptAudit',
        component: () => import('@/views/receiptAudit/ReceiptAudit'),
        meta: { title: '收据审核', icon: bxAnaalyse },
      },
      {
        path: 'receipt-query',
        name: 'receiptQuery',
        component: () => import('@/views/receiptTheQuery/ReceiptTheQuery'),
        meta: { title: '收据查询', icon: bxAnaalyse },
      },
      {
        path: 'receipt-print-list',
        name: 'receiptPrintList',
        component: () => import('@/views/receiptPrintList/ReceiptPrintList'),
        meta: { title: '收据打印', icon: bxAnaalyse },
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

### 收据收款页面

![收据收款](https://figure-b.ricardolsw.com/image/%E6%94%B6%E6%8D%AE%E6%94%B6%E6%AC%BE.png)

### 收据审核页面

![收据审核](https://figure-b.ricardolsw.com/image/%E6%94%B6%E6%8D%AE%E5%AE%A1%E6%A0%B8.png)

### 收据查询页面

![收据查询](https://figure-b.ricardolsw.com/image/%E6%94%B6%E6%8D%AE%E6%9F%A5%E8%AF%A2.png)

### 收据打印页面

![收据打印](https://figure-b.ricardolsw.com/image/%E6%94%B6%E6%8D%AE%E6%89%93%E5%8D%B0.png)
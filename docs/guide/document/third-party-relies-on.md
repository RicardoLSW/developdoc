# 收据打印页面

## 收据详情Mock

在src/mock/services/receipt.js里新增收据详情Mock：

```javascript
import Mock from 'mockjs2'
import { builder } from '../util'

// 获取收据编号
const getOrderNo = () => {
  return builder({
    receiptNo: Mock.mock('@integer(100000000, 999999999)'),
  })
}

// 查询收据详情
const finReceiptOrder = () => {
  return builder({
    id: 11841,
    receiptNo: '20200719000001',
    receiptType: 'PICK',
    receiptTypeMeaning: '梯货款',
    receiptMoney: 10,
    submitDate: '2020-07-19 17:34:08',
    receiptStatusMeaning: '待付款',
    receiptStatus: 'TO_PAY',
    payer: '财务部测试付款人',
    payDate: null,
    receiptSource: '100006',
    receiptSourceMeaning: '财务部',
    nodeLevel: 'LEVEL4',
    processAssignee: 'nbs13,u2083,',
    processAssigneeName: '王威,庞宏',
    objectVersionNumber: 2,
    payType: 'WEIXIN',
    payTypeMeaning: '微信支付',
    receiptDesc: '财务部收据描述',
    invoiceNo: '财务部测试发票号',
    customerNo: null,
    contractNo: null,
    receiptMoneyCapital: '壹拾元整',
    businessSource: 'FinPayReceiptProcess',
    createdBy: 'nbs35',
    printStatus: 'N',
    paidNo: null,
    payStatus: null,
    qrCode: 'weixin://wxpay/aaa?pr=bbb',
  })
}

Mock.mock(/\/order-no/, 'get', getOrderNo)
Mock.mock(/\/fin-receipt-order/, 'get', finReceiptOrder)
```

## api接口

在src/api/api.js新增以下接口：

```javascript
const getFinReceiptOrderDetail = (params) => getAction('/fin-receipt-order', params) // 获取收据单详情
export { getFinReceiptOrderDetail }
```

## html转canvas、导出PDF工具类

在src/utils/util.js新增以下工具类：

```javascript
import html2canvas from 'html2canvas'
import JSPDF from 'jspdf'

/**
 * html转canvas
 * @param formEleId 父元素id
 * @param toEleId 要转换的子元素id
 * @param multiple 缩放倍数
 */
export function toCanvas(formEleId, toEleId, multiple) {
  const targetDom = document.querySelector(`#${formEleId}`)
  const copyDom = targetDom.cloneNode(true)
  copyDom.style.width = targetDom.scrollWidth + 'px'
  copyDom.style.height = targetDom.scrollHeight + 'px'
  document.body.appendChild(copyDom)
  html2canvas(targetDom, {
    allowTaint: false,
    useCORS: true,
    height: targetDom.scrollHeight,
    width: targetDom.scrollWidth,
  }).then((canvas) => {
    canvas.setAttribute('id', toEleId)
    copyDom.parentNode.removeChild(copyDom)
    canvas.style.width = parseFloat(canvas.style.width) * multiple + 'px'
    canvas.style.height = parseFloat(canvas.style.height) * multiple + 'px'
    document.querySelector(`#${formEleId}`).removeChild(document.querySelector(`#${toEleId}`))
    document.querySelector(`#${formEleId}`).appendChild(canvas)
  })
}

/**
 * canvas转pdf导出
 * @param eleId canvas元素id
 * @param pdfName pdf文件名字
 */
export function exportPDF(eleId, pdfName) {
  const canvas = document.querySelector(`#${eleId}`)
  // 另存为pdf格式
  const pageData = canvas.toDataURL('image/jpeg', 1.0)
  const contentWidth = canvas.width
  const contentHeight = canvas.height
  // 一页pdf显示html页面生成的canvas高度;
  const pageHeight = (contentWidth / 592.28) * 841.89
  // 未生成pdf的html页面高度
  let leftHeight = contentHeight
  // 页面偏移
  let position = 0
  // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
  const imgWidth = 595.28
  const imgHeight = (592.28 / contentWidth) * contentHeight
  const pdf = new JSPDF('', 'pt', 'a4')
  // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
  // 当内容未超过pdf一页显示的范围，无需分页
  if (leftHeight < pageHeight) {
    pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
  } else {
    while (leftHeight > 0) {
      pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
      leftHeight -= pageHeight
      position -= 841.89
      // 避免添加空白页
      if (leftHeight > 0) {
        pdf.addPage()
      }
    }
  }
  pdf.save(`${pdfName}.pdf`)
}
```

::: tip 注意

这里我们需要安装html2canvas、jspdf这两个依赖。

运行`yarn add html2canvas jspdf`安装依赖即可

:::

## 日期格式化

在src/utils/filter.js新增日期格式化过滤器：

```javascript
/**
 * 过滤器：日期格式化 xxxx年xx月xx日
 */
Vue.filter('localDay', function (dataStr, pattern = 'LL') {
  return moment(dataStr).format(pattern)
})
```

## 创建收据打印页面

在src/views/receiptPrint目录下新建ReceiptPrint.vue文件：

```vue
<template>
  <a-card :bordered="false">
    <div class="flex-row" style="justify-content: space-between; align-items: center;">
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
          >收据</span
        >
      </div>
      <a-button type="primary" @click="print">收据打印</a-button>
    </div>
    <div class="flex-column" style="justify-content: center; align-items: center; padding: 24px;">
      <div id="print-box">
        <div id="receipt">
          <div style="width: 1000px; height: 410px; background: #fccce7;">
            <div class="flex-row" style="justify-content: center; align-items: center; position: relative;">
              <div style="padding-bottom: 3px; border-bottom: 1px solid black;">
                <div style="font-size: 32px; padding: 5px 64px; text-align: center; border-bottom: 1px solid black;">
                  收<span style="margin: 0px 24px;"></span>据
                </div>
              </div>
              <div style="position: absolute; right: 50px; font-size: 32px; bottom: 0px;">
                NQ<span style="color: #0c47c0;">{{ infoData.receiptNo }}</span>
              </div>
            </div>
            <div class="flex-row" style="padding: 20px 30px 0px; font-size: 18px; position: relative;">
              <div>单位：XXXXXX有限公司</div>
              <div style="position: absolute; right: 250px;">{{ infoData.submitDate | localDay }}</div>
            </div>
            <div
              class="flex-column"
              style="
                margin: 10px;
                border: 1.2px solid black;
                height: 230px;
                justify-content: space-between;
                align-items: center;
                font-size: 18px;
                font-weight: 400;
                position: relative;
              "
            >
              <div class="flex-row" style="width: 100%; padding: 20px 10px;">
                <div class="flex-row">
                  <span>付款单位</span>
                  <div style="width: 400px; border-bottom: 1px solid black; padding: 0 20px;">
                    {{ infoData.payer }}
                  </div>
                </div>
                <div class="flex-row">
                  <span>付款方式</span>
                  <div style="width: 394px; border-bottom: 1px solid black; padding: 0 20px;">
                    {{ infoData.payTypeMeaning }}
                  </div>
                </div>
              </div>
              <div class="flex-row" style="width: 100%; padding: 20px 10px;">
                <div class="flex-row">
                  <span>人民币（大写）</span>
                  <div style="width: 400px; border-bottom: 1px solid black; padding: 0 20px;">
                    {{ infoData.receiptMoneyCapital }}
                  </div>
                </div>
                <div class="flex-row">
                  <span>¥</span>
                  <div style="width: 400px; border-bottom: 1px solid black; padding: 0 20px;">
                    {{ infoData.receiptMoney }}
                  </div>
                </div>
              </div>
              <div class="flex-row" style="width: 100%; padding: 20px 10px;">
                <span>系付</span>
                <div style="width: 900px; border-bottom: 1px solid black; padding: 0 20px;">
                  {{ infoData.receiptTypeMeaning }}，{{ infoData.receiptDesc }}
                </div>
              </div>
              <div
                style="
                  position: absolute;
                  right: 10px;
                  width: 20px;
                  margin: 0 auto;
                  line-height: 24px;
                  top: 50%;
                  transform: translateY(-50%);
                "
              >
                客户联
              </div>
            </div>
            <div class="flex-row-space-around" style="font-size: 18px; padding: 0px 30px;">
              <div>单位公章：</div>
              <div>复核人：</div>
              <div>收款人：</div>
              <div>制单：李</div>
            </div>
          </div>
          <div style="width: 1000px; height: 410px; background: #fccce7; margin-top: 50px;">
            <div class="flex-row" style="justify-content: center; align-items: center; position: relative;">
              <div style="padding-bottom: 3px; border-bottom: 1px solid black;">
                <div style="font-size: 32px; padding: 5px 64px; text-align: center; border-bottom: 1px solid black;">
                  收<span style="margin: 0px 24px;"></span>据
                </div>
              </div>
              <div style="position: absolute; right: 50px; font-size: 32px; bottom: 0px;">
                NQ<span style="color: #0c47c0;">{{ infoData.receiptNo }}</span>
              </div>
            </div>
            <div class="flex-row" style="padding: 20px 30px 0px; font-size: 18px; position: relative;">
              <div>单位：XXXXXX有限公司</div>
              <div style="position: absolute; right: 250px;">{{ infoData.submitDate | localDay }}</div>
            </div>
            <div
              class="flex-column"
              style="
                margin: 10px;
                border: 1.2px solid black;
                height: 230px;
                justify-content: space-between;
                align-items: center;
                font-size: 18px;
                font-weight: 400;
                position: relative;
              "
            >
              <div class="flex-row" style="width: 100%; padding: 20px 10px;">
                <div class="flex-row">
                  <span>付款单位</span>
                  <div style="width: 400px; border-bottom: 1px solid black; padding: 0 20px;">
                    {{ infoData.payer }}
                  </div>
                </div>
                <div class="flex-row">
                  <span>付款方式</span>
                  <div style="width: 394px; border-bottom: 1px solid black; padding: 0 20px;">
                    {{ infoData.payTypeMeaning }}
                  </div>
                </div>
              </div>
              <div class="flex-row" style="width: 100%; padding: 20px 10px;">
                <div class="flex-row">
                  <span>人民币（大写）</span>
                  <div style="width: 400px; border-bottom: 1px solid black; padding: 0 20px;">
                    {{ infoData.receiptMoneyCapital }}
                  </div>
                </div>
                <div class="flex-row">
                  <span>¥</span>
                  <div style="width: 400px; border-bottom: 1px solid black; padding: 0 20px;">
                    {{ infoData.receiptMoney }}
                  </div>
                </div>
              </div>
              <div class="flex-row" style="width: 100%; padding: 20px 10px;">
                <span>系付</span>
                <div style="width: 900px; border-bottom: 1px solid black; padding: 0 20px;">
                  {{ infoData.receiptTypeMeaning }}，{{ infoData.receiptDesc }}
                </div>
              </div>
              <div
                style="
                  position: absolute;
                  right: 10px;
                  width: 20px;
                  margin: 0 auto;
                  line-height: 24px;
                  top: 50%;
                  transform: translateY(-50%);
                "
              >
                记账联
              </div>
            </div>
            <div class="flex-row-space-around" style="font-size: 18px; padding: 0px 30px;">
              <div>单位公章：</div>
              <div>复核人：</div>
              <div>收款人：</div>
              <div>制单：李</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script>
import { exportPDF, toCanvas } from '@/utils/util'
import { getFinReceiptOrderDetail } from '@/api/api'

export default {
  name: 'ReceiptPrint',
  data() {
    return {
      icon: [require('@/assets/icons/u692.png')],
      infoData: {},
    }
  },
  mounted() {
    if (this.$route.query.receiptNo) {
      getFinReceiptOrderDetail(this.$route.query.receiptNo).then((res) => {
        if (['TO_PAY', 'NOT_TRANSFER', 'TRANSFERRED'].includes(res.result.receiptStatus)) {
          this.infoData = res.result
          setTimeout(() => {
            toCanvas('print-box', 'receipt', 1)
          }, 0)
        }
      })
    }
  },
  methods: {
    print() {
      exportPDF('receipt', 'receipt')
    },
  },
}
</script>

<style scoped></style>
```

## 添加到路由菜单

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
     	......
      {
        path: 'receipt-print',
        name: 'receiptPrint',
        component: () => import('@/views/receiptPrint/ReceiptPrint'),
        meta: { title: '收据打印详情' },
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

## 页面效果

![收据打印2](https://figure-b.ricardolsw.com/image/%E6%94%B6%E6%8D%AE%E6%89%93%E5%8D%B02.png)

## 导出PDF效果

![image-20200822112412250](https://figure-b.ricardolsw.com/image/image-20200822112412250.png)


# 工作台页面

由于ant design pro这个框架自带了很多示例页面，所以在开始开发页面之前，我们需要把该项目多余的页面都剔除掉。

1. 修改config/router.config.js中的路由配置，我们只保留登陆页：

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
       children: [],
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

2. 移除views文件夹多余页面，仅保留下图这些文件：

   ![image-20200809154628403](https://figure-b.ricardolsw.com/image/image-20200809154628403.png)

## 创建工作台页面

在views文件夹下新建views/dashboard/WorkSpace.vue：

```vue
<template>
  <div style="padding: 20px;">
    <a-row :gutter="24">
      <a-col :span="6">
        <a-card :bordered="false">
          <div class="card">
            <div class="card-icon">
              <a-avatar shape="square" :size="56" :src="icon[0]" />
            </div>
            <div class="card-content">
              <div class="card-title">今日收据总数</div>
              <div class="card-label">{{ todayCount }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false">
          <div class="card">
            <div class="card-icon">
              <a-avatar shape="square" :size="56" :src="icon[0]" />
            </div>
            <div class="card-content">
              <div class="card-title">近七天收据总数</div>
              <div class="card-label">{{ lastWeekCount }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false">
          <div class="card">
            <div class="card-icon">
              <a-avatar shape="square" :size="56" :src="icon[1]" />
            </div>
            <div class="card-content">
              <div class="card-title">今日收据总额</div>
              <div class="card-label">{{ todayReceiptMoney | numberFormat }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false">
          <div class="card">
            <div class="card-icon">
              <a-avatar shape="square" :size="56" :src="icon[1]" />
            </div>
            <div class="card-content">
              <div class="card-title">近七天收据总额</div>
              <div class="card-label">{{ lastWeekReceiptMoney | numberFormat }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <a-row style="margin: 20px 0;">
      <a-card title="常用功能" :bordered="false">
        <div class="flex-row-space-around commonly-used-functions">
          <div class="common-item" @click="toPage('receiptIssued')" v-action:receiptIssued>收据开具</div>
          <div
            class="common-item"
            style="display: flex; justify-content: space-between;"
            @click="toPage('receiptAudit')"
            v-action:receiptAudit
          >
            <span>收据审核</span>
            <a
              >(<span>{{ assigneeNum }}</span
              >)</a
            >
          </div>
          <div class="common-item" @click="toPage('receiptCollection')" v-action:receiptCollection>收据收款</div>
          <div class="common-item" @click="toPage('receiptQuery')" v-action:receiptQuery>收据查询</div>
          <div class="common-item" @click="toPage('receiptPrintList')" v-action:receiptPrintList>收据打印</div>
        </div>
      </a-card>
    </a-row>
    <a-row :gutter="24">
      <a-col :span="12">
        <a-card title="收据统计" :bordered="false">
          <div style="width: 200px; position: absolute; right: 20px; top: 12px;">
            <a-select placeholder="" @change="handleChange" style="width: 100%;" default-value="PREPAID">
              <a-select-option v-for="(item, index) in receiptTypeList" :value="item.receiptType" :key="index">{{
                item.receiptTypeMeaning
              }}</a-select-option>
            </a-select>
          </div>
          <div>
            <div class="flex-row-space-around">
              <div style="flex: 1;">
                <div style="color: rgba(0, 0, 0, 0.427450980392157); font-weight: 400;">
                  本月{{ receiptTypeMeaning }}收据总数
                </div>
                <div class="flex-row-space-around">
                  <span style="color: rgba(0, 0, 0, 0.647058823529412); font-size: 24px; flex: 1;">{{
                    thisMouthRcptCount
                  }}</span>
                  <span style="color: rgba(0, 0, 0, 0.427450980392157); flex: 1;"
                    >{{ thisMouthOrderPct
                    }}<a-icon type="caret-up" style="color: #52c41a;" v-if="rcptCountFlag === 'UP'" /><a-icon
                      type="caret-down"
                      style="color: #f5222d;"
                      v-else-if="rcptCountFlag === 'DOWN'"
                  /></span>
                </div>
              </div>
              <div style="flex: 1;">
                <div style="color: rgba(0, 0, 0, 0.427450980392157); font-weight: 400;">
                  本月{{ receiptTypeMeaning }}收据总额
                </div>
                <div class="flex-row-space-around">
                  <span style="color: rgba(0, 0, 0, 0.647058823529412); font-size: 24px; flex: 1;">{{
                    thisMouthRcptMoney | numberFormat
                  }}</span>
                  <span style="color: rgba(0, 0, 0, 0.427450980392157); flex: 1;"
                    >{{ thisMouthMoneyPct
                    }}<a-icon type="caret-up" style="color: #52c41a;" v-if="rcptMoneyFlag === 'UP'" /><a-icon
                      type="caret-down"
                      style="color: #f5222d;"
                      v-else-if="rcptMoneyFlag === 'DOWN'"
                  /></span>
                </div>
              </div>
            </div>
            <v-chart
              :force-fit="true"
              :height="325"
              :data="lineChart.data"
              :scale="lineChart.scale"
              :padding="lineChart.padding"
            >
              <v-tooltip />
              <v-axis />
              <v-legend />
              <v-line position="day*count" :color="['type', ['#3BC25A', '#1890ff']]" />
            </v-chart>
          </div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="收据类别占比" :bordered="false">
          <a-radio-group default-value="LAST_SEVEN_DAY" style="margin-bottom: 16px;" @change="pieChange">
            <a-radio-button value="LAST_SEVEN_DAY">
              近七天
            </a-radio-button>
            <a-radio-button value="THIS_MOUTH">
              本月
            </a-radio-button>
            <a-radio-button value="THIS_QUARTER">
              本季度
            </a-radio-button>
          </a-radio-group>
          <h4>收据类别占比</h4>
          <div>
            <v-chart
              :force-fit="true"
              :height="305"
              :data="pieChart.data"
              :scale="pieChart.scale"
              :padding="pieChart.padding"
              style="display: flex; align-items: center;"
            >
              <v-tooltip :showTitle="false" dataKey="receiptTypeMeaning*percent" />
              <v-legend
                :useHtml="true"
                position="right-center"
                :reactive="true"
                :containerTpl="pieChart.containerTplLegend"
                :itemTpl="pieChart.itemTplLegend"
              ></v-legend>
              <v-pie position="percent" color="receiptTypeMeaning" :vStyle="pieChart.style" />
              <v-coord type="theta" :radius="0.75" :innerRadius="0.75" />
              <v-guide type="html" :position="pieChart.position" :html="pieChart.html" />
            </v-chart>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import DataSet from '@antv/data-set'
import { mapGetters } from 'vuex'
import { baseMixin } from '@/store/app-mixin'

export default {
  name: 'WorkSpace',
  mixins: [baseMixin],
  data() {
    return {
      icon: [require('@/assets/icons/u104.png'), require('@/assets/icons/u126.png')],
      lineChart: {
        data: null,
        scale: [
          {
            dataKey: 'monthDate',
            min: 0,
            max: 1,
          },
        ],
        padding: [50, 50, 80, 50],
        style: { stroke: '#fff', lineWidth: 1 },
      },
      pieChart: {
        data: null,
        scale: [
          {
            dataKey: 'percent',
            min: 0,
            formatter: '.2%',
          },
        ],
        style: {
          stroke: '#fff',
          lineWidth: 1,
        },
        padding: [0, 300, 0, 50],
        containerTplLegend: null,
        html: null,
        position: ['50%', '50%'],
        itemTplLegend: (value, color, checked, index) => this.itemTpl(value, color, checked, index),
      },
      receiptCategoryAccountedFor: [], // 收据类别占比
      dataStatisticsData: [], // 收据统计
      lastWeekCount: null, // 近七天收据总数
      lastWeekReceiptMoney: null, // 近七天收据总额
      todayCount: null, // 今日收据总数
      todayReceiptMoney: null, // 今日收据总额
      receiptTypeList: [], // 收据类型
      thisMouthRcptCount: null, // 本月预付款收据总数
      thisMouthRcptMoney: null, // 本月预付款收据总额
      thisMouthOrderPct: null, // 本月预付款收据总数-百分比
      thisMouthMoneyPct: null, // 本月预付款收据总额-百分比
      rcptCountFlag: null, // 本月预付款收据总数-图标状态
      rcptMoneyFlag: null, // 本月预付款收据总额-图标状态
      receiptTotalMoney: null, // 收据总额
      assigneeNum: null, // 收据审核待办数量
      receiptTypeMeaning: '预付款',
    }
  },
  mounted() {
    const { userInfo } = this
    console.log(userInfo())
  },
  methods: {
    ...mapGetters(['userInfo']),
    /**
     * 绘制折线图
     * @param data
     */
    initLineChart(data) {
      this.lineChart.data = new DataSet().createView().source(data).transform({
        type: 'map',
      })
    },
    /**
     * 绘制饼图
     * @param data
     */
    initPieChart(data) {
      this.pieChart.data = new DataSet().createView().source(data).transform({
        type: 'percent',
        field: 'receiptPct',
        dimension: 'receiptTypeMeaning',
        as: 'percent',
      })

      // 饼图-中间自定义html-收据总额
      this.pieChart.html = `<div class="g2-guide-html flex-column" style="justify-content: center; align-items: center;">
                              <span
                                class="title"
                                style="
                                  color: rgba(0, 0, 0, 0.427450980392157);
                                  font-weight: 400;
                                  font-family: 'PingFangSC-Regular', 'PingFang SC';
                                "
                                >收据总额</span
                              ><span class="value" style="color: rgba(0, 0, 0, 0.847058823529412); font-size: 24px;"
                                >¥ ${this.receiptTotalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span
                              >
                            </div>`

      // 饼图自定义图例
      this.pieChart.containerTplLegend = `<div class="g2-legend"> <table class="g2-legend-list"></table> </div>`
      const id = 'legend-html'
      if (document.getElementById(id)) {
        return
      }
      const styleTxt = `
        #canvas .g2-legend {
        top: 45%!important;
        }
        .g2-legend{
            position:absolute;
        }
        .g2-legend-list{
            list-style:none;
            margin:0;
            padding:0;
        }
        .g2-legend-list-item{
            cursor:pointer;
            font-size:14px;
        }
    `
      const style = document.createElement('style')
      style.setAttribute('id', id)
      style.innerHTML = styleTxt
      document.getElementsByTagName('head')[0].appendChild(style)
    },
    /**
     * 饼图自定义图例
     * @param value
     * @param color
     * @param checked
     * @param index
     * @returns {string}
     */
    itemTpl(value, color, checked, index) {
      const obj = this.pieChart.data.rows[index]
      checked = checked ? 'checked' : 'unChecked'
      return `<tr class="g2-legend-list-item item-${index} ${checked}" data-value="${value}" data-color="${color}">
                <td style="width: 120px;">
                  <i
                    class="g2-legend-marker"
                    style="width:10px;height:10px;display:inline-block;margin-right:10px;background-color:${color};"
                  ></i>
                  <span class="g2-legend-text" style="color: #666;"> ${value}</span>
                </td>
                <td style="text-align: left; width: 80px;">${obj?.receiptPct}%</td>
                <td style="text-align: left; color: #666; width: 80px;">
                  ¥${obj?.receiptMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </td>
              </tr>`
    },
    /**
     * 切换饼图
     * @param e
     */
    pieChange(e) {},
    /**
     * 常用功能跳转
     * @param value
     */
    toPage(value) {
      this.$router.push({ name: value })
    },
    /**
     * 切换折线图
     * @param value
     */
    handleChange(value) {
      this.receiptTypeMeaning = this.receiptTypeList.filter((e) => e.receiptType === value)[0].receiptTypeMeaning
    },
  },
}
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  .card-icon {
    flex: 2;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .card-content {
    flex: 3;
    display: flex;
    flex-flow: column nowrap;
    .card-title {
      color: rgba(0, 0, 0, 0.427450980392157);
      font-size: 18px;
      font-weight: 400;
      font-family: 'PingFangSC-Regular', 'PingFang SC';
    }
    .card-label {
      color: rgba(0, 0, 0, 0.847058823529412);
      font-size: 30px;
    }
  }
}
.commonly-used-functions {
  div {
    padding: 10px 20px;
    border-bottom: 1px solid rgba(235, 235, 235, 1);
    flex: 1;
    color: rgba(0, 0, 0, 0.647058823529412);
    font-size: 16px;
    font-weight: 500;
    font-family: 'PingFangSC-Medium', 'PingFang SC Medium', 'PingFang SC';
  }
  div + div {
    margin-left: 30px;
  }
}
.common-item:hover {
  color: #1890ff;
  cursor: pointer;
}
</style>
```

## 将文件加入菜单和路由

在config/router.config.js中asyncRouterMap里加入我们的新页面：

```javascript
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
    ],
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true,
  },
]
```


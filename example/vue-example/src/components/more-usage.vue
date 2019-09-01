<template>
  <div>
    <p>query data is: </p>
    <div>query: {{query}}</div>
    <p>update query method</p>
    <div class="data-content">
      <div v-show="loading">loading....</div>
      <div v-show="!loading">content</div>
    </div>
    <div class="option">
      <button @click="update('num')">update num</button>
      <button @click="update('date')">update date</button>
      <button @click="update('customType')">update customType</button>
      <button @click="update('order')">update order</button>
    </div>
  </div>
</template>

<script>
import { init, extend } from 'friendly-query'
import dateformat from 'dateformat'

const queryDataType = {
  date: {
    type: 'Date',
    value: new Date()
  },
  num: {
    type: 'Int',
    value: 10001,
  },
  order: {
    type: 'Array',
    value: []
  },
  customType: {
    type: 'DateArray',
    value: []
  }
}

export default {
  data () {
    return {
      instance: undefined,
      query: [],
      loading: false
    }
  },

  mounted () {
    // first, extend custom data type
    extend({
      DateArray: {
        parse (str, value, option) {
          if (!str) return value

          return str.split(option.separator).map(item => {
            return new Date(item)
          })
        },
        stringify (value, option) {
          if (!value.length) return ''

          return value.map(item => dateformat(item, option.format)).join(option.separator)
        },
        option: {
          separator: ',',
          format: 'yyyy/mm/dd hh:MM'
        }
      }
    })

    // second, init query type
    this.instance = init([{
      type: queryDataType,
      // queryDataType change callback. Usually user click browsers back button or forward button
      callback: () => {
        this.query = this.instance.load()[0]
        this.fetchMethod()
      }
    }])

    // third, load query type
    this.query = this.instance.load()[0]
  },

  beforeDestroy () {
    // remove event listener
    this.instance.destroy()
  },

  methods: {
    sendRequest (params) {
      console.log('send params', params)
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
    },
    fetchMethod () {
      this.loading = true
      // usually convert js data to pure string
      // in order to send to backend
      this.sendRequest(this.instance.convert(this.query, true)).then(() => {
        this.loading = false
      })
    },

    update (prop) {
      // 模拟数据发生变化的处理
      switch (prop) {
      case 'num':
        this.query.num++
        break
      case 'date':
        this.query.date = new Date(+this.query.date + 24 * 60 * 60 * 1000)
        break
      case 'customType':
        this.query.customType.push(new Date(Date.now() + parseInt(Math.random() * 7) * 24 * 60 * 60 * 1000))
        break
      case 'order':
        this.query.order.push(['time', 'count', 'price'][parseInt(Math.random() * 3)])
        break
      }

      // 更新到当前页面路径
      this.$router.push({
        name: this.$route.name,
        query: this.instance.convert(this.query, true)
      })
      this.fetchMethod()
    }
  }
}
</script>

<style>
.data-content {
  border: 1px solid #aaa;
}
.option {
  margin-top: 24px;
}
</style>

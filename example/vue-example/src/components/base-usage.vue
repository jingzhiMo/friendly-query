<template>
  <div>
    <p>query data is: </p>
    <div
      v-for="(q, index) in query"
      :key="index"
    >query{{index}}: {{q}}</div>
    <p>update query method</p>
    <div class="data-content">
      <div v-show="loading1">loading1....</div>
      <div v-show="!loading1">first content</div>
      <div v-show="loading2">loading2....</div>
      <div v-show="!loading2">second content</div>
    </div>
    <div class="option">
      <button @click="update('num')">update num</button>
      <button @click="update('numAry')">update numAry</button>
      <button @click="update('date')">update date</button>
    </div>
    <div class="option">
      <button @click="update('search')">update search</button>
      <button @click="update('order')">update order</button>
    </div>
  </div>
</template>

<script>
import { init } from 'friendly-query'

const queryDataType1 = {
  date: {
    type: 'Date',
    value: new Date()
  },
  num: {
    type: 'Int',
    value: 10001,
  },
  numAry: {
    type: 'IntArray',
    value: []
  }
}

const queryDataType2 = {
  search: {
    type: 'String',
    value: '-'
  },
  order: {
    type: 'Array',
    value: ['time']
  }
}

export default {
  data () {
    return {
      instance: undefined,
      query: [],
      loading1: false,
      loading2: false
    }
  },

  mounted () {
    this.instance = init([{
      type: queryDataType1,
      // queryDataType change callback. Usually user click browsers back button or forward button
      callback: () => {
        this.$set(this.query, 0, this.instance.load()[0])
        this.fetchMethod1()
      }
    }, {
      type: queryDataType2,
      callback: () => {
        this.$set(this.query, 1, this.instance.load()[1])
        this.fetchMethod2()
      }
    }])
    this.query = this.instance.load()
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
    fetchMethod1 () {
      this.loading1 = true
      this.sendRequest(this.instance.convert(this.query[0])).then(() => {
        this.loading1 = false
      })
    },

    fetchMethod2 () {
      this.loading2 = true
      this.sendRequest(this.instance.convert(this.query[1])).then(() => {
        this.loading2 = false
      })
    },

    update (prop) {
      let method

      // 模拟数据发生变化的处理
      switch (prop) {
      case 'num':
        this.query[0].num++
        method = 'fetchMethod1'
        break
      case 'numAry':
        this.query[0].numAry.push(parseInt(Math.random() * 10))
        method = 'fetchMethod1'
        break
      case 'date':
        this.query[0].date = new Date(+this.query[0].date + 24 * 60 * 60 * 1000)
        method = 'fetchMethod1'
        break
      case 'search':
        var search

        do {
          search = ['google', 'baidu', 'sougou'][parseInt(Math.random() * 3)]
        } while (search === this.query[1].search)

        this.query[1].search = search
        method = 'fetchMethod2'
        break
      case 'order':
        this.query[1].order.push(['time', 'count', 'price'][parseInt(Math.random() * 3)])
        method = 'fetchMethod2'
        break
      }

      // 更新到当前页面路径
      this.$router.push({
        name: this.$route.name,
        query: this.instance.convert(this.query)
      })
      this[method]()
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

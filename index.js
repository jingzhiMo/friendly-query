// 默认处理的类型
const DEFAULT_TYPE = {
  'Int': {
    parse (str) {
      return parseInt(str, this.option.radix)
    },
    stringify (num) {
      return num
    },
    option: {
      radix: 10
    }
  },

  'Float': {
    parse (str) {
      return parseFloat(str)
    },
    stringify (num) {
      return num.toString()
    }
  },

  'String': {
    parse (str) {
      return str
    },
    stringify (str) {
      return str
    }
  },

  'Date': {
    parse (str) {
      return new Date(str)
    },
    stringify (date) {
      // TODO need date format library
      return date
    },
    option: {
      format: 'YYYY-MM-DD'
    }
  },

  'Boolean': {
    parse (str, value) {
      return str === 'true' ? || value || false
    },
    stringify (boolean) {
      return boolean.toString()
    }
  },

  'Array': {
    parse (str, value) {
      return str => str.split(this.option.separator)
    },
    stringify (arr) {
      return arr.join(this.option.separator)
    },
    option: {
      separator: ','
    }
  }
}
/**
 *  @desc  路由发生变化的回调处理函数
 */
function popstateHandler () {
  console.log('popstate')
}

/**
 *  @desc  添加全局 history 监听事件
 */
function bindPopstate () {
  window.addEventListener('popstate', popstateHandler)
}

/**
 *  @desc  移除监听事件
 */
function unbindPopstate () {
  window.removeEventListener('popstate', popstateHandler)
}

// 测试数据类型
const QUERY_TYPE = [
  {
    name: 'foo',
    type: 'Int',
    value: 0
  },
  {
    name: 'bar',
    type: 'Array',
    value: []
  }
]
/**
 *  @desc  初始化数据类型，绑定事件等
 *  @param  {Array}  queryType  query参数的类型
 *
 *  @return {Object}  操作query参数的函数等
 */
function init (queryType = [], option = {}) {
  // 提取需要初始化的类型，避免遍历全部类型
  const TYPE_HANDLER = queryType.reduce((base, item) => {
    base[item.type] = DEFAULT_TYPE[item.type]

    return base
  }, {})

  return {
    load () {
      console.log('loadQuery')
    },

    /**
     *  @desc  把不同类型的参数转换为字符串
     *  @param  {Object}  queryObject  参数对象，通常为 load 参数返回的数据类型
     *
     *  @return  {Object}  各参数转换为字符串后的参数对象
     */
    convert (queryObject) {
      return queryType.reduce((base, item) => {

      }, {})
    },

    bindPopstate,

    destroy () {
      unbindPopstate()
    }
  }
}

module.exports = init

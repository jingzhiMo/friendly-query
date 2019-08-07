const extendObject = require('lodash/extend')
const { isNull } = require('./util/is-null')
const urlParse = require('./util/url-parse')
const { DEFAULT_TYPE, DEFAULT_OPTION } = require('./type')
const pubSub = require('./util/pub-sub')
let localType = extendObject({}, DEFAULT_TYPE)
let localOption = extendObject({}, DEFAULT_OPTION)

// 劫持pushState方法
let pushState = window.history.pushState
window.history.pushState = function (...arg) {
    pushState.apply(window.history, arg)
    // 触发 pushState 订阅事件
    pubSub.notify('pushState')
}

/**
 *  @desc  比较两个不同的query参数，返回相对之前更新的字段
 *  @param  {Object}  oldVal  旧的query参数
 *  @param  {Object}  newVal  新的query参数
 *
 *  @return {Array}
 */
function diffQuery (oldVal, newVal) {
  let diffAttr = new Set([])

  for (let key in newVal) {
    if (oldVal[key] !== newVal[key]) {
      diffAttr.add(key)
    }
  }

  for (let key in oldVal) {
    if (oldVal[key] !== newVal[key]) {
      diffAttr.add(key)
    }
  }

  return Array.from(diffAttr)
}

/**
 *  @desc  路由发生变化的回调处理函数
 */
function popstateHandler (attrGroup = [], initQuery) {
  let group = [] // { attr: [], cb: fn }
  let oldQuery = initQuery

  return [
    // setCurrentQuery
    (value) => {
      oldQuery = value
    },

    // popstate handler
    () => {
      let newQuery = urlParse()
      let diffAttr = diffQuery(oldQuery, newQuery)

      // 更新完后，当前的参数置为oldQuery
      oldQuery = newQuery
      console.log('diffAttr', diffAttr)
    }
  ]
}

/**
 *  @desc  添加全局 history 监听事件
 */
function bindPopstate (handler) {
  window.addEventListener('popstate', handler)
}

/**
 *  @desc  移除监听事件
 */
function unbindPopstate (handler) {
  window.removeEventListener('popstate', handler)
}

/**
 *  @desc  初始化数据类型，绑定事件等
 *  @param  {Array}  queryType  query参数的类型
 *
 *  @return {Object}  操作query参数的函数等
 */
function init (queryType, option = {}) {
  const USER_OPTION = extendObject({}, localOption, option)

  // 提取需要初始化的类型，避免遍历全部类型
  const typeHandler = queryType.type.reduce((base, item) => {
    base[item.type] = localType[item.type]

    return base
  }, {})
  // 绑定全局事件处理
  const [setCurrentQuery, handler] = popstateHandler([queryType], urlParse())
  bindPopstate(handler)

  // 监听 history.pushState 的回调方法
  let topicId = pubSub.subscribe('pushState', () => {
    setCurrentQuery(urlParse())
  })

  return {
    /**
     *  @desc  把url的query转换成数据对象
     *
     *  @return  {Object}
     */
    load () {
      query = urlParse()

      return queryType.type.reduce((base, item) => {
        base[item.name] = typeHandler[item.type].parse(query[item.name], item.value, USER_OPTION[item.type])
        return base
      }, {})
    },

    /**
     *  @desc  把不同类型的参数转换为字符串
     *  @param  {Object}  queryObject  参数对象，通常为 load 参数返回的数据类型
     *
     *  @return  {Object}  各参数转换为字符串后的参数对象
     */
    convert (queryObject) {
      return queryType.type.reduce((base, { type, name }) => {
        let value = typeHandler[type].stringify(queryObject[name], USER_OPTION[type])

        // valid data, no null or ''
        if (!isNull(value)) {
          base[name] = value
        }

        return base
      }, {})
    },

    /**
     *  @desc  取消绑定 popstate 事件
     */
    destroy () {
      // 移除订阅事件
      pubSub.unsubscribe(topicId)
      // 移除postate事件监听
      unbindPopstate(handler)
    }
  }
}

/**
 *  @desc  扩充数据类型
 *  @param  {Object}  type  数据类型
 *
 *  @return
 */
function extend (type = {}) {
  for (let key in type) {
    let { parse, stringify, option } = type[key]

    localType[key] = {
      parse: parse,
      stringify: stringify
    }
    localOption[key] = option
  }
}


// 测试数据类型
/*
const QUERY_TYPE = [
  {
    name: 'foo',
    type: 'Int',
    value: 0
  },
  {
    name: 'bar',
    type: 'IntArray',
    value: [1, 2, 3]
  },
  {
    name: 'baz',
    type: 'Array',
    value: ['a', 'b', 'c']
  }
]

init({
  type: QUERY_TYPE,
  cb () {
    console.log('cb')
  }
})
*/

module.exports = {
  init,
  extend
}

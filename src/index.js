import extendObject from 'lodash/extend'
import { isNull } from './util/is-null'
import urlParse from './util/url-parse'
import { DEFAULT_TYPE, DEFAULT_OPTION } from './type/index'
import pubSub from './util/pub-sub'

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
function popstateHandler (groupType = [], initQuery) {
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
      let callbackSet = new Set()

      diffAttr.forEach(attr => {
        groupType.forEach(({ type, callback }) => {
          if (type[attr]) {
            callbackSet.add(callback)
          }
        })
      })

      for (let callback of callbackSet) {
        callback()
      }

      // 更新完后，当前的参数置为oldQuery
      oldQuery = newQuery
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
 *  @param  {Array|Object}  groupType  分组的query参数，当为Object类型的时候，则视为只有一个分组
 *  @param  {Object} groupType[i].type  对应组的类型
 *  @param  {Object} groupType[i].callback  对应组参数更改的回调函数
 *
 *  @return {Object}  操作query参数的函数等
 */
export function init (groupType, option = {}) {
  const userOption = extendObject({}, localOption, option)

  if (!Array.isArray(groupType)) {
    groupType = [groupType]
  }

  // 绑定全局事件处理
  const [setCurrentQuery, handler] = popstateHandler(groupType, urlParse())
  // 监听 history.pushState 的回调方法
  const topicId = pubSub.subscribe('pushState', () => {
    setCurrentQuery(urlParse())
  })
  // 汇总所有分组的字段
  let summaryGroup = groupType.reduce((baseValue, group) => {
    return extendObject(baseValue, group.type)
  }, {})

  // 绑定浏览器事件
  bindPopstate(handler)

  return {
    /**
     *  @desc  把url的query转换成数据对象
     *
     *  @return  {Object}
     */
    load () {
      // 获取 url 上的参数
      let query = urlParse()

      // 返回分组对应的参数
      return groupType.map(group => {
        let itemData = {}

        for (let name in group.type) {
          let type = group.type[name].type

          itemData[name] = localType[type].parse(query[name], summaryGroup[name].value, userOption[type])
        }

        return itemData
      })
    },

    /**
     *  @desc  把不同类型的参数转换为字符串
     *  @param  {Array|Object}  groupQuery  参数对象，通常为 load 参数返回的数据类型
     *  @param  {Boolean}  isMerged  是否把每个数组的对象合并到一个，默认不合并
     *
     *  @return  {Array}  各参数转换为字符串后的参数对象
     */
    convert (groupQuery, isMerged = false) {
      if (!Array.isArray(groupQuery)) {
        groupQuery = [groupQuery]
        isMerged = true
      }

      let groupString = groupQuery.map(group => {
        let itemString = {}

        for (let name in group) {
          let type = summaryGroup[name].type
          let value = localType[type].stringify(group[name], userOption[type])

          // valid data, no null or ''
          if (!isNull(value)) {
            itemString[name] = value
          }
        }

        return itemString
      })

      return groupString
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
export function extend (type = {}) {
  for (let key in type) {
    let { parse, stringify, option } = type[key]

    localType[key] = {
      parse: parse,
      stringify: stringify
    }
    localOption[key] = option
  }
}

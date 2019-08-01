const dateFormat = require('dateformat')
const { isNull, isUndef } = require('./util/is-null')

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
    /**
     *  @desc  把url的query转换成数据对象
     *  @param  {Object}  query  已转化为对象的url参数
     *
     *  @return  {Object}
     */
    load (query) {
      return queryType.reduce((base, item) => {
        base[item.name] = TYPE_HANDLER[item.type].parse(query[item.name], item.value)
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
      return queryType.reduce((base, item) => {
        // 数据为空
        let value = TYPE_HANDLER[item.type].stringify(queryObject[item.name])

        if (!isNull(value)) {
          base[item.name] = value
        }

        return base
      }, {})
    },

    bindPopstate,

    /**
     *  @desc  取消绑定 popstate 事件
     */
    destroy () {
      unbindPopstate()
    }
  }
}

module.exports = init

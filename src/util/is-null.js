/**
 *  @desc  判断 url 该字段是否为空
 *  @param  {String}  val
 */
export function isNull (val) {
  return val === '' || val === undefined
}

/**
 *  @desc  判断数据是否为null或undefined
 */
export function isUndef (val) {
    return val === null || val === undefined
}

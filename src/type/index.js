import dateFormat from 'dateformat'
import { isNull, isUndef } from '../util/is-null'

export const DEFAULT_OPTION = {
  'Int': {
    // 默认转换为10进制
    radix: 10
  },
  'Date': {
    format: 'yyyy-mm-dd'
  },
  'Array': {
    separator: ','
  },
  'IntArray': {
    separator: ',',
    // 默认转换为10进制
    radix: 10
  },
  'FloatArray': {
    separator: ','
  }
}

export const DEFAULT_TYPE = {
  'Int': {
    parse (str, value, option) {
      if (isNull(str)) return value

      let num = parseInt(str, option.radix)

      // not a number
      if (isNaN(num)) return value

      return num
    },
    stringify (num) {
      if (isUndef(num)) return

      return num.toString()
    }
  },

  'Float': {
    parse (str, value) {
      if (isNull(str)) return value

      let num = parseFloat(str)

      // not a number
      if (isNaN(num)) return value

      return num
    },
    stringify (num) {
      if (isUndef(num)) return

      return num.toString()
    }
  },

  'String': {
    parse (str, value) {
      return isNull(str) ? value : str
    },
    stringify (str) {
      return str
    }
  },

  'Date': {
    parse (str, value) {
      if (isNull(str)) return value

      return new Date(str)
    },
    stringify (date, option) {
      if (isUndef(date)) return

      return dateFormat(date, option.format)
    }
  },

  'Boolean': {
    parse (str, value) {
      if (isNull(str)) return value

      return str === 'true' || false
    },
    stringify (boolean) {
      return boolean.toString()
    }
  },

  // 数组类型
  'Array': {
    parse (str, value, option) {
      if (isNull(str)) return value

      return str.split(option.separator)
    },
    stringify (arr = [], option) {
      if (!arr.length) return

      return arr.join(option.separator)
    }
  },

  // 整数数组类型
  'IntArray': {
    parse (str, value, option) {
      if (isNull(str)) return value

      return str.split(option.separator).map(item => parseInt(item, option.radix))
    },
    stringify (arr = [], option) {
      if (!arr.length) return

      return arr.join(option.separator)
    }
  },

  'FloatArray': {
    parse (str, value, option) {
      if (isNull(str)) return value

      return str.split(option.separator).map(item => parseFloat(item))
    },
    stringify (arr = [], option) {
      if (!arr.length) return

      return arr.join(option.separator)
    }
  }
}

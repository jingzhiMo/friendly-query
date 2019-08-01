const DEFAULT_TYPE = {
  'Int': {
    parse (str, value) {
      if (isNull(str)) return value

      let num = parseInt(str, this.option.radix)

      // not a number
      if (isNaN(num)) return value

      return num
    },
    stringify (num) {
      if (isUndef(num)) return

      return num.toString()
    },
    option: {
      // 默认转换为10进制
      radix: 10
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
    stringify (date) {
      if (isUndef(date)) return

      // TODO need date format library
      return dateFormat(date, this.option.format)
    },
    option: {
      format: 'yyyy-mm-dd'
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
    parse (str, value) {
      if (isNull(str)) return value

      return str.split(this.option.separator)
    },
    stringify (arr = []) {
      if (!arr.length) return

      return arr.join(this.option.separator)
    },
    option: {
      separator: ','
    }
  },

  // 整数数组类型
  'IntArray': {
    parse (str, value) {
      if (isNull(str)) return value

      return str.split(this.option.separator).map(item => parseInt(item, this.option.radix))
    },
    stringify (arr = []) {
      if (!arr.length) return

      return arr.join(this.option.separator)
    },
    option: {
      separator: ',',
      // 默认转换为10进制
      radix: 10
    }
  },

  'FloatArray': {
    parse (str, value) {
      if (isNull(str)) return value

      return str.split(this.option.separator).map(item => parseFloat(item))
    },
    stringify (arr = []) {
      if (!arr.length) return

      return arr.join(this.option.separator)
    },
    option: {
      separator: ','
    }
  }
}

// 默认支持的类型与处理方法
module.exports = DEFAULT_TYPE

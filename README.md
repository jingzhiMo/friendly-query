# friendly-query


一个配合url的query参数使用的工具

## install

```
yarn add friendly-query
# or
npm install friendly-query
```

## usage

### 初始化url参数的对应的数据类型

```js
import { init } from 'friendly-query'

let instance = init({
  type: {
    foo: {
        type: 'String',
        value: 'foo' // value 值为默认的数据
    },
    bar: {
        type: 'IntArray',
        value: []
    },
    baz: {
        type: 'Date',
        value: new Date()
    }
  },
  // popstate 事件触发后，如果对应的url参数发生变化，则会触发该函数
  callback () {
    console.log('query update')
  }
})
```

### url参数转换为具体数据类型

```js
// instance 为初始化的实例
// 例子1: url为；www.example/
let queryData = instance.load()
console.log(queryData)
// 因为url的参数都为空，所以赋值为默认值
// [{
//     foo: 'foo',
//     bar: [],
//     baz: new Date()
// }]

// 例子2: url为：www.example/?foo=foovalue&bar=101,102&baz=2019-01-01
let queryData = instance.load()
console.log(queryData)
// 因为url对应的参数不为空，会取对应的值，然后经过规则处理，例如 Date 类型，会把url参数转换为 Date 类型，具体类型可以往下看
// [{
//     foo: 'foovalue',
//     bar: [101, 102],
//     baz: new Date('2019-01-01')
// }]
```

### 具体数据类型转换为url的字符串类型

```js
// 例子1
let stringQuery = instance.convert({
    foo: 'foovalue',
    bar: [101, 102],
    baz: new Date('2019-01-01')
})
console.log(stringQuery)
// {
//     foo: 'foovalue',
//     bar: '101,102',
//     baz: '2019-01-01'
// }

// 例子2
let stringQuery = instance.convert({
    foo: 'foovalue',
    bar: []
})
console.log(stringQuery)
// {
//     foo: 'foovalue'
// }
```

## more usage

### 更改数据类型配置
例如对于`IntArr`的数据类型，默认根据逗号`,`分割多个元素，如果更改这个规则，可以在`init`方法的时候，传入第二个参数

```js
import { init } from 'friendly-query'

let instance = init({
  type: {
    foo: {
        type: 'IntArray',
        value: []
    }
  },
  callback () {}
}, {
  'IntArray': {
    separator: '-' // 分隔符更改为 '-'
  }
})

// 当前url为： www.example.com/?foo=101-102-103
instance.load() // [{ foo: [101, 102, 103] }]
instance.convert({ foo: [101, 102] }) // { foo: '101-102' }
```

### 自定义数据类型
如果默认的数据类型不符合需求，可以新增数据类型：

```js
import { init, extend } from 'friendly-query'

extend({
  'myType': {
    parse (str, value, option) {
      if (!str) return option.prefix

      return option.prefix + str
    },
    stringify (value, option) {
      return value + option.suffix
    },
    option: {
      prefix: 'type_',
      suffix: '_sf'
    }
  }
})

let instance = init({
  foo: {
    type: 'myType',
    value: ''
  }
})

// 当前url地址为： www.example.com/?foo=foovalue
instance.load() // [{ foo: 'type_foovalue' }]
instance.convert({ foo: 'foovalue' }) // { foo: 'foovalue_sf' }
```

更多数据类型配置可以看配置表格

## 默认支持数据类型

|type|option|description|
| :-----| :---- | :---- |
| Int | `option.radix`: 转换为整型的进制，默认值：`10` | 整型 |
| Float | none | 浮点数类型，转换的时候调用 `parseFloat` |
| String | none | 字符串类型 |
| Date | `option.format`: Date类型转字符串的时间格式，默认值：`yyyy-mm-dd`；| 日期类型；详细支持的日期格式可以参考[dateformat](https://github.com/felixge/node-dateformat#mask-options)|
| Boolean | none | 布尔类型 |
| Array | `option.separator`：url参数字符串形式转换为数组的分隔符，默认值：`,` | 数组类型 |
| IntArray | `option.separator`：url参数字符串形式转换为数组的分隔符，默认值：`,`<br>`option.radix`：转换为整型的进制，默认值：`10` | 数组类型，数组每个元素都通过`parseInt`转换为整型 |
| FloatArray | `option.separator`：url参数字符串形式转换为数组的分隔符，默认值：`,`| 数组类型，数组每个元素都经过`parseFloat`转换为浮点数 |


## API

### 全局方法
#### init

* 参数
  * `Object|Array dataType`
  * `Object option`（可选）
* 返回值：用于后续处理数据的对象
* 用法

初始化当前页面所有用到的url参数的类型；并**全局监听 popstate 事件**

```js
import { init } from 'friendly-query'

// dataType 为对象形式
let instance = init({
  type: {
    foo: {
      type: 'Array', // 表示该参数的数据类型
      value: [] // value的值表示，如果url参数为空的时候，则使用该默认值；例如`?foo=`的时候，那么通过 load 方法得到的值，则是设定默认值空数组 []
    }
  },
  callback () {}
})

// dataType 为数组形式，url参数分成多组处理，可以对不同组别内发生改变的参数，调用该组的回调方法
// 当 popstate 事件触发时，foo 若发生变化则对应callbackFoo会被调用；若 bar 发生变化则对应callbackBar会被调用
let instance = init([{
  type: {
    foo: {
      type: 'Array',
      value: []
    }
  },
  callbackFoo () {}
}, {
  type: {
    bar: {
      type: String,
      value: ''
    }
  },
  callbackBar () {}
}])
```


#### extend

* 参数
  * `Object`
* 用法：

自定义参数的数据类型与数据转换方法

```js
import { extend } from 'friendly-query'

extend({
  type1: {
    parse () {},
    stringify () {},
    option: {}
  },
  type2: {
    parse () {},
    stringify () {},
    option: {}
  }
})
```

*需要注意的是，若传入的数据类型与默认已支持的类型一致，则默认类型的处理方法会被覆盖；建议对默认支持的类型，在`init`方法更改对应类型的`option`*

### 实例方法
实例是指：`init()`函数返回的对象

#### load

* 参数： 无
* 返回值：`Array` 转换后的url参数数据；数组的每个元素为`init`传入的分组参数对应
* 用法

获取当前url参数转化后的数据类型

```js
instance.load()
```

#### convert

* 参数：`{Array|Object} groupQuery` 需要从设定的数据类型转换为url参数所用的字符串类型
* 返回值：`Array` 根据参数分组返回对应转换后的字符串数据
* 用法

```js
// 例子1:
instance.convert({
  date: new Date('2019-01-01'),
  fooArray: [101, 102]
})
// [{
//   date: '2019-01-01',
//   fooArray: '101,102'
// }]

// 例子2:
instance.convert([
  {
    date: new Date('2019-01-01')
  }, 
  {
    fooArray: [101, 102]
  }
])
// [
//   {
//     date: '2019-01-01'
//   }, 
//   {
//     fooArray: '101,102'
//   }
// ]
```

#### destroy

* 参数： 无
* 用法

移除当前页面监听的事件与内部事件

```js
instance.destroy()
```

**注意：当从不同路由切换的时候，需要在路由切换前，先执行`destroy`方法，否则会重复监听事件**
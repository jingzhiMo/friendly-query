// 监听的事件列表
let topicList = {}
let uid = 0

module.exports = {
    notify (topic, ...arg) {
        // 没有相关订阅事件
        if (!topicList[topic] || !topicList[topic].length) return

        topicList[topic].forEach(cbData => {
            // 传递对应的参数
            cbData.fn.apply(null, arg)
        })
    },

    // 订阅事件
    subscribe (topic, cb) {
        const cbData = {
            id: uid++,
            fn: cb
        }

        // 已存在对应的事件类型
        if (topicList[topic]) {
            topicList.push(cbData)
        } else {
            topicList[topic] = [cbData]
        }

        return cbData.id
    },

    // 移除订阅事件
    unsubscribe (topic, id) {
        if (!topicList[topic] || !topicList[topic].length) return

        topicList[topic] = topicList[topic].filter(item => item.id !== id)
    }
}

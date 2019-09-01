/**
 *  @desc  对页面的url query 参数进行解析，返回对象
 *
 *  @return  {Object}
 */
const parseQuery = () => {
    const query = window.location.search.substring(1)

    const group = query.split('&')
    let param = {}

    for (let i = 0; i < group.length; i++) {
        const [key, value] = group[i].split('=')

        if (key.trim().length) {
            param[key] = decodeURIComponent(value)
        }
    }

    return param
}

export default parseQuery

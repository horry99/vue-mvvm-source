// 数据劫持
class Observer {
    constructor(data) {
        this.observe(data)
    }

    // 数据‘可测性’
    observe(data) {
        console.log(data);
        if (data instanceof Object) {
            Object.keys(data).forEach(key => {
                // 数据的每个数据都是可观测的
                this.defineReactive(data, key, data[key])
            })
        }
    }

    defineReactive(data, key, value) {
        let that = this
        this.observe(value)
        Object.defineProperty(data, key, {
            get() {
                return value
            },
            set(newValue) {
                if (newValue != value) {
                    // 如果新值是对象，继续劫持
                    that.observe(newValue)
                    value = newValue
                }
            }
        })
    }
}
// 数据劫持
class Observer {
    constructor(data) {
        this.observe(data)
    }

    // 数据‘可测性’
    observe(data) {
        if (data instanceof Object) {
            Object.keys(data).forEach(key => {
                // 数据的每个数据都是可观测的
                this.defineReactive(data, key, data[key])
                this.observe(data[key]) // 深度劫持
            })
        }
    }

    defineReactive(data, key, value) {
        let that = this
        let dep = new Dep() // 每个变化的数据 都会有一个对应的数组，这个数组是存放所有更新的数据
        Object.defineProperty(data, key, {
            get() {
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue) {
                if (newValue != value) {
                    // 如果新值是对象，继续劫持
                    that.observe(newValue)
                    value = newValue
                    // 通知所有的依赖，数据更新了
                    dep.notify()
                }
            }
        })
    }
}

class Dep {
    constructor() {
        this.subs = []
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}
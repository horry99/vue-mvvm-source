// 数据劫持
class Observer {
    constructor(data) {
        this.observer(data)
    }

    observer(data) {
        // 判断是否是对象,才监测
        if (data instanceof Object) {
            for (let key in data) {
                this.defineReactive(data, key, data[key])
            }
        }
    }

    defineReactive(obj, key, value) {
        const _this = this
        // 该数组存放所有更新的数据
        let dep = new Dep()
        // 如果value还是对象，还需要观察sa
        this.observer(value);
        Object.defineProperty(obj, key, {
            get() {
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue) {
                if (newValue != value) {
                    _this.observer(newValue); // 如果赋值的也是对象的话  还需要观察
                    value = newValue
                    // 通知所有的依赖，数据更新了
                    dep.notify()
                }
            }
        })
    }
}

// 依赖收集器
class Dep {
    constructor() {
        this.subs = []
    }

    // 添加依赖
    addSub(watcher) {
        this.subs.push(watcher)
    }
    // 通知依赖更新
    notify() {
        this.subs.forEach(watcher => {
            watcher.update()
        })
    }
}
// watcher为需要跟新的数据,创建更新
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb // 更新回调
        // 存放老数据
        this.value = this.get()
    }

    getVal(vm, expr) {
        // 数据层级结构比较深
        expr = expr.split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)

    }
    get() {
        Dep.target = this // 将当前实例赋值给依赖收集的容器(有多少依赖，就会有多少个watcher)
        let value = this.getVal(this.vm, this.expr) // this.vm（去实例）会调用getter/setter
        Dep.target = null // 更新完再将依赖收集清空
        return value
    }
    update() {
        let newValue = this.getVal(this.vm, this.expr)
        let oldValue = this.value
        if (newValue != oldValue) {
            this.cb(newValue) // 执行update的callback
        }
    }
}

// 新旧值对比,不一致就通知更新
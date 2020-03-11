// watcher为需要跟新的数据,创建更新
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb // 更新回调
        // 存放老数据
        this.value = this.get(vm, expr)
    }

    getVal(vm, expr) {
        // 数据层级结构比较深
        expr = expr.split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)

    }
    get(vm, expr) {
        let value = this.getVal(vm, expr)
        return value
    }
    update(vm, expr) {
        let newValue = this.getVal(vm, expr)
        let oldValue = this.value
        if (newValue != oldValue) {
            this.cb(newValue) // 执行update的callback
        }
    }
}

// 新旧值对比,不一致就通知更新
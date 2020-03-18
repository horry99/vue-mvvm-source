class Watcher {
    constructor(expr, vm, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb // 更新回调
        this.value = this.get() // 保存老数据
    }


    getVal(expr, vm) {
        expr = expr.split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)

    }
    get() {
        // 将当前实例赋值给依赖收集的容器
        Dep.target = this
        // this.expr会进入到getter/setter
        let value = this.getVal(this.expr, this.vm)
        Dep.target = null // 更新完再将依赖收集清空
        return value
    }

    // 更新函数
    update() {
        let newValue = this.get(this.expr, this.vm)
        let oldValue = this.value
        if (newValue != oldValue) {
            this.cb()
        }
    }
}
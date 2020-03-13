class MVVM {
    constructor(options) {
        // 先把有用的东西挂载在实例上
        this.$el = options.el
        this.$data = options.data

        // 首先判断有没有模板，有的话再编译
        if (this.$el) {
            new Observer(this.$data)
            // 将this.$data代理到this上面
            this.proxyData(this.$data)
            new Compile(this.$el, this)
        }
    }

    proxyData(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                },
                set(newValue) {
                    data[key] = newValue
                }
            })
        })

    }
}
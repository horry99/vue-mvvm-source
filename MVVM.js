class MVVM {
    constructor(options) {
        // 先把有用的东西挂载在实例上
        this.$el = options.el
        this.$data = options.data

        // 首先判断有没有模板，有的话再编译
        if (this.$el) {
            new Observer(this.$data)
            new Compile(this.$el, this)
        }
    }


}
class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm
        if (this.el) {
            // 如果能获取到这个元素，我们才进行编译
            //1. 将真实dom,移入到内存中
            let fragment = this.node2Fragment(this.el)
            // 2.编译=>提取想要的元素节点（指令v-model）/文本节点{{}} 
            this.compile(fragment)
            // 3.将编译好的fragment再塞回到页面上
            this.el.appendChild(fragment)
        }
    }

    /**
     * 专门写一些辅助的方法
    */

    // 判断是不是个节点
    isElementNode(node) {
        // 元素类型
        return node.nodeType === 1
    }
    // 判断是不是指令
    isDirective(name) {
        return name.includes('v-')
    }


    /**
     * 一些核心方法
    */
    compileElement(node) {
        // 获取指令的值放入到元素的value中去
        let attrs = node.attributes // 获取当前元素的属性节点
        Array.from(attrs).forEach(attr => {
            let attrName = attr.name // 属性名
            // 判断有没有包含v-
            if (this.isDirective(attrName)) {
                let expr = attr.value // 属性值
                // 调用相对应的指令函数 
                let [, type] = attrName.split('-')
                compileUtil[type](node, this.vm, expr)
            }
        })
    }
    compileText(node) {
        // 带{{}}
        let expr = node.textContent // 去文本中的内容
        let reg = /\{\{([^}]+)\}\}/g   // {{a}} {{b}} {{c}}
        if (reg.test(expr)) {
            compileUtil['text'](node, this.vm, expr)
        }
    }
    compile(fragment) {
        // 获取所有的元素(第一层元素)
        let childNodes = fragment.childNodes // 得到的结果是文档集合
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 是元素节点,还需要深入检查
                // 编译元素
                this.compileElement(node)
                this.compile(node)
            } else {
                // 是文本节点
                // 编译文本
                this.compileText(node)
            }
        })
    }
    node2Fragment(el) {
        // 将dom节点一个一个的移入内存中
        let fragment = document.createDocumentFragment()
        let firstChild
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment // 内存中的节点，页面上的节点都移除了
    }
}

// 编译工具类方法集合
compileUtil = {
    getVal(vm, expr) {
        // 数据层级结构比较深
        expr = expr.split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)

    },
    setVal(vm, expr, value) {
        expr = expr.split('.')
        return expr.reduce((prev, next, currentIndex) => {
            if (currentIndex == expr.length - 1) {
                return prev[next] = value
            }
            return prev[next]
        }, vm.$data)
    },
    getTextVal(vm, expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1])
        })
    },
    text(node, vm, expr) { // 文本处理
        let updateFn = this.updater["textUpdater"]
        // {{a}} {{b}} 多个文本
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            new Watcher(vm, arguments[1], (newValue) => {
                // 当数据更新了,文本节点需要重新获取依赖的属性更新文本中的内容（A的值变了，需要重新获取A的值再加上B的值，重新渲染）
                let value = this.getTextVal(vm, expr)
                updateFn && updateFn(node, value)
            })
        })
        let value = this.getTextVal(vm, expr)
        updateFn && updateFn(node, value)
    },
    model(node, vm, expr) { // v-model（输入框）处理函数
        let updateFn = this.updater["modelUpdater"]
        new Watcher(vm, expr, (newValue) => {
            // 如果调用watcher的update函数,就会触发cb回调，将新的值传递过来
            updateFn && updateFn(node, this.getVal(vm, expr))
        })
        node.addEventListener('input', (e) => {
            let value = e.target.value
            this.setVal(vm, expr, value)
        })
        updateFn && updateFn(node, this.getVal(vm, expr))
    },
    updater: {
        // 文本更新
        textUpdater(node, value) {
            node.textContent = value
        },
        // model指令更新
        modelUpdater(node, value) {
            node.value = value
        }
    }

}
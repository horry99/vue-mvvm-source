// 模板编译
class Compile {
    constructor(el, vm) {
        /**
        * @param {*} el 元素 注意：el选项中有可能是‘#app’字符串也有可能是document.getElementById('#app')
        * @param {*} vm 实例
        */
        // 判断是不是元素
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm

        if (this.el) {
            // 1.将当前根节点的所有节点放入到内存中
            let fragment = this.node2Fragment(this.el)
            // 2.编译-提取文本节点和元素节点
            this.compile(fragment)
            // 3.将编译好的节点放回到真实DOM里
            this.el.appendChild(fragment)
        }
    }
    // 判断编译文本的正则
    isTextReg() {
        return /\{\{([^}]+)\}\}/g
    }
    // 判断是不是元素
    isElementNode(node) {
        return node.nodeType === 1
    }
    // 判断是不是指令
    isDirective(name) {
        return name.includes('v-')
    }
    compileElement(node) {
        // 获取元素节点的所有属性
        let attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            let attrName = attr.name // 属性名
            let expr = attr.value
            // 判断是否存在v-指令
            if (this.isDirective(attrName)) {
                // todo...
                let [, type] = attrName.split('-')
                // node  message.title  this.vm.$data.message.title
                compileUtil[type](node, expr, this.vm)
            }
        })

    }
    compileText(node) {
        // 获取文本节点,并将大括号中的内容替换成数据
        let expr = node.textContent
        if (this.isTextReg().test(expr)) {
            // todo...
            compileUtil['text'](node, expr, this.vm)
        }
    }
    compile(fragment) {
        // 从文档碎片中获取所有的节点[注意：这里的childNodes只是所有的第一层节点]
        let childNodes = fragment.childNodes
        Array.from(childNodes).forEach(node => {
            // 判断当前节点是文本还是元素
            if (this.isElementNode(node)) {
                // 元素节点,还需要深入编译
                this.compileElement(node)
                this.compile(node)
            } else {
                // 文本节点
                this.compileText(node)
            }
        })
    }
    node2Fragment(el) {
        // 创建一个文档碎片，将所有的孩子都写入到该碎片中
        let fragment = document.createDocumentFragment()
        let firstChild
        // dom节点一个一个的移入内存中
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        // 内存中的节点，页面上的节点都移除了
        return fragment
    }

}

compileUtil = {
    // 获取值
    getVal(expr, vm) {
        // message.title
        expr = expr.split('.')
        return expr.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    },
    setVal(expr, value) {
        expr = expr.split('.')
        return expr.reduce((prev, next, currentIndex) => {
            if (currentIndex == expr.length - 1) {
                return prev[next] = value
            }
            return prev[next]
        }, vm.$data)
    },
    getTextVal(expr, vm) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(arguments[1], vm)
        })
    },
    text(node, expr, vm) {
        const updateFn = this.updater['textUpdater']
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            new Watcher(arguments[1], vm, (newValue) => {
                // 当数据更新了,文本节点需要重新获取依赖的属性更新文本中的内容（A的值变了，需要重新获取A的值再加上B的值，重新渲染）
                updateFn && updateFn(node, this.getTextVal(expr, vm))
            })
        })
        updateFn && updateFn(node, this.getTextVal(expr, vm))
    },
    /**
     * 处理v-modal
     * @param {*} node 对应的节点
     * @param {*} expr 表达式
     * @param {*} vm 当前实例
     */
    model(node, expr, vm) {
        // 不同的指令调取不同的方法
        const updateFn = this.updater['modelUpdater']
        // 数据更新,会调用watcher的update方法，重新编译元素
        new Watcher(expr, vm, (newValue) => {
            updateFn && updateFn(node, this.getVal(expr, vm))
        })
        node.addEventListener('input', (e) => {
            let newValue = e.target.value
            this.setVal(expr, newValue)
        })
        updateFn && updateFn(node, this.getVal(expr, vm))
    },
    updater: {
        // 文本更新
        textUpdater(node, value) {
            node.textContent = value
        },
        // 元素更新
        modelUpdater(node, value) {
            node.value = value
        }
    }
}
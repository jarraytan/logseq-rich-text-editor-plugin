<template>
    <!-- 数学符号面板 -->
    <div class="math-palette-overlay" @click="closeMathPalette">
        <div class="math-palette" @click.stop>
            <div class="math-palette-header">
                <h3>数学符号</h3>
                <button @click="closeMathPalette" class="close-btn">×</button>
            </div>

            <div class="math-palette-content">
                <div class="quick-math-buttons">
                    <button v-for="item in quickMathFormulas" :key="item.name"
                        @click="insertQuickFormula(item.formula, item.displayMode)" class="quick-math-btn">
                        <div class="quick-math-preview" v-html="renderFormulaPreview(item.formula, item.displayMode)">
                        </div>
                        <div class="quick-math-name">{{ item.name }}</div>
                    </button>
                </div>

                <div class="math-symbols-panel">
                    <div class="symbols-category" v-for="category in symbolCategories" :key="category.name">
                        <h4 class="category-title">{{ category.name }}</h4>
                        <div class="symbols-grid">
                            <button v-for="symbol in category.symbols" :key="symbol.code" @click="insertSymbol(symbol)"
                                class="symbol-item" :title="`${symbol.name} (${symbol.code})`">
                                <div class="symbol-display" v-html="renderSymbol(symbol)"></div>
                                <div class="symbol-code">{{ symbol.code }}</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { renderKaTeX } from '../extensions/MathExtension'

const emit = defineEmits(['insert-symbol', 'close-math-palette', 'insert-quickformula'])

// 符号分类
const symbolCategories = [
    {
        name: '希腊字母',
        symbols: [
            { name: 'Alpha', code: '\\alpha', latex: '\\alpha' },
            { name: 'Beta', code: '\\beta', latex: '\\beta' },
            { name: 'Gamma', code: '\\gamma', latex: '\\gamma' },
            { name: 'Delta', code: '\\delta', latex: '\\delta' },
            { name: 'Epsilon', code: '\\epsilon', latex: '\\epsilon' },
            { name: 'Zeta', code: '\\zeta', latex: '\\zeta' },
            { name: 'Eta', code: '\\eta', latex: '\\eta' },
            { name: 'Theta', code: '\\theta', latex: '\\theta' },
            { name: 'Iota', code: '\\iota', latex: '\\iota' },
            { name: 'Kappa', code: '\\kappa', latex: '\\kappa' },
            { name: 'Lambda', code: '\\lambda', latex: '\\lambda' },
            { name: 'Mu', code: '\\mu', latex: '\\mu' },
            { name: 'Nu', code: '\\nu', latex: '\\nu' },
            { name: 'Xi', code: '\\xi', latex: '\\xi' },
            { name: 'Omicron', code: '\\omicron', latex: '\\omicron' },
            { name: 'Pi', code: '\\pi', latex: '\\pi' },
            { name: 'Rho', code: '\\rho', latex: '\\rho' },
            { name: 'Sigma', code: '\\sigma', latex: '\\sigma' },
            { name: 'Tau', code: '\\tau', latex: '\\tau' },
            { name: 'Upsilon', code: '\\upsilon', latex: '\\upsilon' },
            { name: 'Phi', code: '\\phi', latex: '\\phi' },
            { name: 'Chi', code: '\\chi', latex: '\\chi' },
            { name: 'Psi', code: '\\psi', latex: '\\psi' },
            { name: 'Omega', code: '\\omega', latex: '\\omega' },
            { name: '大写 Alpha', code: '\\Alpha', latex: 'A' },
            { name: '大写 Gamma', code: '\\Gamma', latex: '\\Gamma' },
            { name: '大写 Delta', code: '\\Delta', latex: '\\Delta' },
            { name: '大写 Theta', code: '\\Theta', latex: '\\Theta' },
            { name: '大写 Lambda', code: '\\Lambda', latex: '\\Lambda' },
            { name: '大写 Pi', code: '\\Pi', latex: '\\Pi' },
            { name: '大写 Sigma', code: '\\Sigma', latex: '\\Sigma' },
            { name: '大写 Phi', code: '\\Phi', latex: '\\Phi' },
            { name: '大写 Psi', code: '\\Psi', latex: '\\Psi' },
            { name: '大写 Omega', code: '\\Omega', latex: '\\Omega' }
        ]
    },
    {
        name: '运算符',
        symbols: [
            { name: '加', code: '+', latex: '+' },
            { name: '减', code: '-', latex: '-' },
            { name: '乘', code: '\\times', latex: '\\times' },
            { name: '除', code: '\\div', latex: '\\div' },
            { name: '点乘', code: '\\cdot', latex: '\\cdot' },
            { name: '正负', code: '\\pm', latex: '\\pm' },
            { name: '负正', code: '\\mp', latex: '\\mp' },
            { name: '等于', code: '=', latex: '=' },
            { name: '不等于', code: '\\neq', latex: '\\neq' },
            { name: '约等于', code: '\\approx', latex: '\\approx' },
            { name: '小于', code: '<', latex: '<' },
            { name: '大于', code: '>', latex: '>' },
            { name: '小于等于', code: '\\leq', latex: '\\leq' },
            { name: '大于等于', code: '\\geq', latex: '\\geq' },
            { name: '远小于', code: '\\ll', latex: '\\ll' },
            { name: '远大于', code: '\\gg', latex: '\\gg' },
            { name: '成比例', code: '\\propto', latex: '\\propto' }
        ]
    },
    {
        name: '集合符号',
        symbols: [
            { name: '属于', code: '\\in', latex: '\\in' },
            { name: '不属于', code: '\\notin', latex: '\\notin' },
            { name: '子集', code: '\\subset', latex: '\\subset' },
            { name: '超集', code: '\\supset', latex: '\\supset' },
            { name: '子集等于', code: '\\subseteq', latex: '\\subseteq' },
            { name: '超集等于', code: '\\supseteq', latex: '\\supseteq' },
            { name: '并集', code: '\\cup', latex: '\\cup' },
            { name: '交集', code: '\\cap', latex: '\\cap' },
            { name: '空集', code: '\\emptyset', latex: '\\emptyset' },
            { name: '无穷', code: '\\infty', latex: '\\infty' },
            { name: '任意', code: '\\forall', latex: '\\forall' },
            { name: '存在', code: '\\exists', latex: '\\exists' },
            { name: '不存在', code: '\\nexists', latex: '\\nexists' }
        ]
    },
    {
        name: '箭头',
        symbols: [
            { name: '左箭头', code: '\\leftarrow', latex: '\\leftarrow' },
            { name: '右箭头', code: '\\rightarrow', latex: '\\rightarrow' },
            { name: '上箭头', code: '\\uparrow', latex: '\\uparrow' },
            { name: '下箭头', code: '\\downarrow', latex: '\\downarrow' },
            { name: '左双箭头', code: '\\Leftarrow', latex: '\\Leftarrow' },
            { name: '右双箭头', code: '\\Rightarrow', latex: '\\Rightarrow' },
            { name: '左右箭头', code: '\\leftrightarrow', latex: '\\leftrightarrow' },
            { name: '左右双箭头', code: '\\Leftrightarrow', latex: '\\Leftrightarrow' },
            { name: '映射到', code: '\\mapsto', latex: '\\mapsto' },
            { name: '到', code: '\\to', latex: '\\to' },
            { name: '推出', code: '\\implies', latex: '\\implies' },
            { name: '等价于', code: '\\iff', latex: '\\iff' }
        ]
    },
    {
        name: '微积分',
        symbols: [
            { name: '微分', code: 'd', latex: 'd' },
            { name: '偏微分', code: '\\partial', latex: '\\partial' },
            { name: '积分', code: '\\int', latex: '\\int' },
            { name: '双重积分', code: '\\iint', latex: '\\iint' },
            { name: '三重积分', code: '\\iiint', latex: '\\iiint' },
            { name: '环路积分', code: '\\oint', latex: '\\oint' },
            { name: '梯度', code: '\\nabla', latex: '\\nabla' },
            { name: '极限', code: '\\lim', latex: '\\lim' },
            { name: '求和', code: '\\sum', latex: '\\sum' },
            { name: '求积', code: '\\prod', latex: '\\prod' },
            { name: '连加', code: '\\bigcup', latex: '\\bigcup' },
            { name: '连乘', code: '\\bigcap', latex: '\\bigcap' }
        ]
    },
    {
        name: '函数',
        symbols: [
            { name: '正弦', code: '\\sin', latex: '\\sin' },
            { name: '余弦', code: '\\cos', latex: '\\cos' },
            { name: '正切', code: '\\tan', latex: '\\tan' },
            { name: '余切', code: '\\cot', latex: '\\cot' },
            { name: '正割', code: '\\sec', latex: '\\sec' },
            { name: '余割', code: '\\csc', latex: '\\csc' },
            { name: '反正弦', code: '\\arcsin', latex: '\\arcsin' },
            { name: '反余弦', code: '\\arccos', latex: '\\arccos' },
            { name: '反正切', code: '\\arctan', latex: '\\arctan' },
            { name: '双曲正弦', code: '\\sinh', latex: '\\sinh' },
            { name: '双曲余弦', code: '\\cosh', latex: '\\cosh' },
            { name: '双曲正切', code: '\\tanh', latex: '\\tanh' },
            { name: '自然对数', code: '\\ln', latex: '\\ln' },
            { name: '对数', code: '\\log', latex: '\\log' },
            { name: '指数', code: '\\exp', latex: '\\exp' },
            { name: '最小值', code: '\\min', latex: '\\min' },
            { name: '最大值', code: '\\max', latex: '\\max' },
            { name: '上确界', code: '\\sup', latex: '\\sup' },
            { name: '下确界', code: '\\inf', latex: '\\inf' }
        ]
    },
    {
        name: '括号',
        symbols: [
            { name: '圆括号左', code: '(', latex: '(' },
            { name: '圆括号右', code: ')', latex: ')' },
            { name: '方括号左', code: '[', latex: '[' },
            { name: '方括号右', code: ']', latex: ']' },
            { name: '花括号左', code: '\\{', latex: '\\{' },
            { name: '花括号右', code: '\\}', latex: '\\}' },
            { name: '角括号左', code: '\\langle', latex: '\\langle' },
            { name: '角括号右', code: '\\rangle', latex: '\\rangle' },
            { name: '绝对值', code: '|', latex: '|' },
            { name: '双竖线', code: '\\|', latex: '\\|' },
            { name: '上取整', code: '\\lceil', latex: '\\lceil' },
            { name: '下取整', code: '\\rceil', latex: '\\rceil' },
            { name: '上取整', code: '\\lfloor', latex: '\\lfloor' },
            { name: '下取整', code: '\\rfloor', latex: '\\rfloor' }
        ]
    },
    {
        name: '装饰符号',
        symbols: [
            { name: '点', code: '\\dot{a}', latex: '\\dot{a}' },
            { name: '两点', code: '\\ddot{a}', latex: '\\ddot{a}' },
            { name: '矢量', code: '\\vec{a}', latex: '\\vec{a}' },
            { name: '尖帽', code: '\\hat{a}', latex: '\\hat{a}' },
            { name: '横线', code: '\\bar{a}', latex: '\\bar{a}' },
            { name: '宽横线', code: '\\overline{a}', latex: '\\overline{a}' },
            { name: '宽箭头', code: '\\overrightarrow{AB}', latex: '\\overrightarrow{AB}' },
            { name: '波浪线', code: '\\tilde{a}', latex: '\\tilde{a}' },
            { name: '宽波浪线', code: '\\widetilde{abc}', latex: '\\widetilde{abc}' },
            { name: '宽尖帽', code: '\\widehat{abc}', latex: '\\widehat{abc}' }
        ]
    }
]


// 快捷公式
const quickMathFormulas = [
    {
        name: '二次公式',
        formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        displayMode: true
    },
    {
        name: '勾股定理',
        formula: 'a^2 + b^2 = c^2',
        displayMode: false
    },
    {
        name: '欧拉公式',
        formula: 'e^{i\\pi} + 1 = 0',
        displayMode: true
    },
    {
        name: '求和',
        formula: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
        displayMode: true
    },
    {
        name: '积分',
        formula: '\\int_{a}^{b} f(x) dx = F(b) - F(a)',
        displayMode: true
    },
    {
        name: '极限',
        formula: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
        displayMode: true
    },
    {
        name: '矩阵',
        formula: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
        displayMode: true
    },
    {
        name: '分数',
        formula: '\\frac{\\partial f}{\\partial x}',
        displayMode: false
    }
]

// 渲染符号
const renderSymbol = (symbol) => {
    try {
        return renderKaTeX(symbol.latex, false, false)
    } catch (error) {
        return symbol.code
    }
}


const renderFormulaPreview = (formula, displayMode) => {
    try {
        return renderKaTeX(formula, displayMode, false)
    } catch (error) {
        return formula
    }
}


// 插入符号
const insertSymbol = (symbol) => {
    emit('insert-symbol', symbol.code)
}

const insertQuickFormula = (formula, mode) => {
    emit('insert-quick-formula', formula, mode)
}

const closeMathPalette = () => {    
    emit('close-math-palette')
}

</script>

<style scoped>
/* 数学符号面板样式 */
.math-palette-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    /* background: rgba(0, 0, 0, 0.5); */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.math-palette {
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    background: var(--ls-primary-background-color);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.math-palette-header {
    padding: 16px 20px;
    background: var(--ls-secondary-background-color);
    border-bottom: 1px solid var(--ls-border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.math-palette-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--ls-primary-text-color);
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
}

.close-btn:hover {
    background: var(--ls-button-hover-background-color);
}

.math-palette-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.quick-math-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
}

.quick-math-btn {
    padding: 12px;
    border: 1px solid var(--ls-border-color);
    border-radius: 8px;
    background: var(--ls-primary-background-color);
    color: var(--ls-primary-text-color);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.quick-math-btn:hover {
    background: var(--ls-button-hover-background-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-math-preview {
    margin-bottom: 8px;
    font-size: 14px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.quick-math-name {
    font-size: 12px;
    color: var(--ls-secondary-text-color);
    font-weight: 500;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
    .math-palette {
        background: #1e1e1e;
        border: 1px solid #404040;
    }

    .math-palette-header {
        background: #2d2d2d;
        border-bottom-color: #404040;
    }

    .quick-math-btn {
        background: #2d2d2d;
        border-color: #404040;
    }

    .quick-math-btn:hover {
        background: #3d3d3d;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
}

.math-symbols-panel {
    padding: 16px 0;
}

.symbols-category {
    margin-bottom: 24px;
}

.symbols-category:last-child {
    margin-bottom: 0;
}

.category-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--ls-primary-text-color);
    margin: 0 0 12px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--ls-border-color);
}

.symbols-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
}

.symbol-item {
    padding: 10px;
    border: 1px solid var(--ls-border-color);
    border-radius: 6px;
    background: var(--ls-primary-background-color);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-height: 80px;
    justify-content: space-between;
}

.symbol-item:hover {
    background: var(--ls-button-hover-background-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--ls-active-border-color);
}

.symbol-display {
    font-size: 16px;
    margin-bottom: 6px;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.symbol-code {
    font-size: 11px;
    color: var(--ls-secondary-text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    word-break: break-all;
    opacity: 0.8;
    transition: opacity 0.2s;
}

.symbol-item:hover .symbol-code {
    opacity: 1;
    color: var(--ls-link-text-color);
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
    .symbol-item {
        background: #2d2d2d;
        border-color: #404040;
    }

    .symbol-item:hover {
        background: #3d3d3d;
        border-color: #4dabf7;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .category-title {
        border-bottom-color: #404040;
    }
}
</style>
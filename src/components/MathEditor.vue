<template>
    <NodeViewWrapper id="Latex_Editor" ref="mathContainer" class="math-node" :class="{
        'math-inline': !attrs.displayMode,
        'math-block': attrs.displayMode,
        'is-editing': isEditing,
        'has-error': hasError
    }" :data-type="'math'" :data-display-mode="attrs.displayMode" :data-formula="attrs.formula"
        :data-token="attrs.token" @click="handleClick" @dblclick="handleDoubleClick" as="div">
        <!-- 编辑模式 -->
        <div v-if="isEditing" class="math-editor">
            <div class="math-editor-header">
                <span class="math-editor-title">
                    {{ attrs.displayMode ? '块级公式' : '行内公式' }}
                </span>
                <div class="math-editor-actions">
                    <button @click.stop="closeEditor" class="math-action-btn" title="完成编辑">
                        X
                    </button>
                </div>
            </div>

            <div class="math-input-container">
                <div class="math-preview">
                    <div class="katex-preview" v-html="renderedFormula"></div>
                    <div v-if="hasError" class="math-error">
                        {{ errorMessage }}
                    </div>
                </div>

                <textarea ref="formulaInput" v-model="formulaText" @keydown="handleKeydown" class="math-formula-input"
                    :placeholder="getPlaceholder()" :style="{ height: textareaHeight + 'px' }" spellcheck="false">
                </textarea>
            </div>

            <!-- 常用符号工具栏 -->
            <div class="math-symbols-toolbar">
                <div class="symbols-group" v-if="!showAllSymbols">
                    <span class="symbols-label">常用符号:</span>
                    <button v-for="symbol in commonSymbols" :key="symbol.symbol" @click="insertSymbol(symbol.symbol)"
                        class="symbol-btn" :title="symbol.name">
                        {{ symbol.display }}
                    </button>
                </div>

                <div class="symbols-group" v-if="!showAllSymbols">
                    <span class="symbols-label">希腊字母:</span>
                    <button v-for="letter in greekLetters" :key="letter.symbol" @click="insertSymbol(letter.symbol)"
                        class="symbol-btn" :title="letter.name">
                        {{ letter.display }}
                    </button>
                </div>

                <div class="symbols-group" v-if="!showAllSymbols">
                    <span class="symbols-label">运算符:</span>
                    <button v-for="op in operators" :key="op.symbol" @click="insertSymbol(op.symbol)" class="symbol-btn"
                        :title="op.name">
                        {{ op.display }}
                    </button>
                </div>

                <div class="symbols-group" v-if="!showAllSymbols">
                    <span class="symbols-label">括号:</span>
                    <button v-for="bracket in brackets" :key="bracket.symbol" @click="insertSymbol(bracket.symbol)"
                        class="symbol-btn" :title="bracket.name">
                        {{ bracket.display }}
                    </button>
                </div>

                <button @click="showAllSymbols = !showAllSymbols" class="toggle-symbols-btn">
                    {{ showAllSymbols ? '隐藏更多符号' : '显示更多符号' }}
                </button>

                <div v-if="showAllSymbols" class="all-symbols-grid">
                    <div v-for="symbol in allSymbols" :key="symbol.symbol" class="symbol-item"
                        @click="insertSymbol(symbol.symbol)" :title="symbol.name">
                        <div class="symbol-preview">{{ symbol.display }}</div>
                        <div class="symbol-code">{{ symbol.symbol }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- RichtextEditor里的预览模式 -->
        <div v-else class="math-preview-mode">
            <div class="katex-rendered" v-html="renderedFormula"></div>

            <div v-if="hasError" class="math-error-preview">
                ❌ 公式错误
            </div>
            <div v-if="!hasError && attrs.formula" class="math-hint">
                <em>点击编辑</em>
            </div>
        </div>
    </NodeViewWrapper>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { renderKaTeX, validateLaTeX } from '../extensions/MathExtension'

const props = defineProps(nodeViewProps)
const attrs = ref(props.node.attrs);
const node = props.node; //旧节点

// 响应式数据
const mathContainer = ref(null)
const formulaInput = ref(null)

const isEditing = ref(false)
const textareaHeight = ref(40)
const showAllSymbols = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const formulaText = ref('')
const isInputDirty = ref(false) // 是否修改过公式文本框

//#region 常量定义

// 常用符号定义
const commonSymbols = [
    { symbol: '\\frac{}{}', name: '分数', display: 'a/b' },
    { symbol: '\\sqrt{}', name: '平方根', display: '√' },
    { symbol: '^{}', name: '上标', display: 'x²' },
    { symbol: '_{}', name: '下标', display: 'x₁' },
    { symbol: '\\sum', name: '求和', display: '∑' },
    { symbol: '\\int', name: '积分', display: '∫' },
    { symbol: '\\infty', name: '无穷大', display: '∞' },
    { symbol: '\\pi', name: '圆周率', display: 'π' }
]

const greekLetters = [
    { symbol: '\\alpha', name: 'alpha', display: 'α' },
    { symbol: '\\beta', name: 'beta', display: 'β' },
    { symbol: '\\gamma', name: 'gamma', display: 'γ' },
    { symbol: '\\delta', name: 'delta', display: 'δ' },
    { symbol: '\\epsilon', name: 'epsilon', display: 'ε' },
    { symbol: '\\theta', name: 'theta', display: 'θ' },
    { symbol: '\\lambda', name: 'lambda', display: 'λ' },
    { symbol: '\\sigma', name: 'sigma', display: 'σ' },
    { symbol: '\\omega', name: 'omega', display: 'ω' }
]

const operators = [
    { symbol: '+', name: '加号', display: '+' },
    { symbol: '-', name: '减号', display: '-' },
    { symbol: '\\times', name: '乘号', display: '×' },
    { symbol: '\\div', name: '除号', display: '÷' },
    { symbol: '=', name: '等号', display: '=' },
    { symbol: '\\neq', name: '不等于', display: '≠' },
    { symbol: '\\leq', name: '小于等于', display: '≤' },
    { symbol: '\\geq', name: '大于等于', display: '≥' }
]

const brackets = [
    { symbol: '(', name: '圆括号左', display: '(' },
    { symbol: ')', name: '圆括号右', display: ')' },
    { symbol: '[', name: '方括号左', display: '[' },
    { symbol: ']', name: '方括号右', display: ']' },
    { symbol: '\\{', name: '花括号左', display: '{' },
    { symbol: '\\}', name: '花括号右', display: '}' },
    { symbol: '\\langle', name: '角括号左', display: '⟨' },
    { symbol: '\\rangle', name: '角括号右', display: '⟩' }
]

// 所有符号
const allSymbols = computed(() => [
    ...commonSymbols,
    ...greekLetters,
    ...operators.filter(op => !['+', '-', '=', '[', ']', '(', ')'].includes(op.symbol)),
    ...brackets.filter(b => !['(', ')', '[', ']', '{', '}'].includes(b.symbol)),
    { symbol: '\\pm', name: '正负号', display: '±' },
    { symbol: '\\mp', name: '负正号', display: '∓' },
    { symbol: '\\cdot', name: '点乘', display: '·' },
    { symbol: '\\ast', name: '星号', display: '∗' },
    { symbol: '\\circ', name: '圆圈', display: '∘' },
    { symbol: '\\bullet', name: '圆点', display: '•' },
    { symbol: '\\nabla', name: 'nabla', display: '∇' },
    { symbol: '\\partial', name: '偏导数', display: '∂' },
    { symbol: '\\ell', name: 'ell', display: 'ℓ' },
    { symbol: '\\hbar', name: 'hbar', display: 'ħ' },
    { symbol: '\\Re', name: '实部', display: 'ℜ' },
    { symbol: '\\Im', name: '虚部', display: 'ℑ' },
    { symbol: '\\forall', name: '任意', display: '∀' },
    { symbol: '\\exists', name: '存在', display: '∃' },
    { symbol: '\\emptyset', name: '空集', display: '∅' },
    { symbol: '\\in', name: '属于', display: '∈' },
    { symbol: '\\notin', name: '不属于', display: '∉' },
    { symbol: '\\subset', name: '子集', display: '⊂' },
    { symbol: '\\supset', name: '超集', display: '⊃' },
    { symbol: '\\subseteq', name: '子集等于', display: '⊆' },
    { symbol: '\\supseteq', name: '超集等于', display: '⊇' },
    { symbol: '\\cup', name: '并集', display: '∪' },
    { symbol: '\\cap', name: '交集', display: '∩' },
    { symbol: '\\wedge', name: '逻辑与', display: '∧' },
    { symbol: '\\vee', name: '逻辑或', display: '∨' },
    { symbol: '\\neg', name: '逻辑非', display: '¬' },
    { symbol: '\\Rightarrow', name: '推出', display: '⇒' },
    { symbol: '\\Leftrightarrow', name: '等价', display: '⇔' },
    { symbol: '\\mapsto', name: '映射到', display: '↦' },
    { symbol: '\\to', name: '到', display: '→' },
    { symbol: '\\gets', name: '从', display: '←' },
    { symbol: '\\uparrow', name: '上箭头', display: '↑' },
    { symbol: '\\downarrow', name: '下箭头', display: '↓' },
    { symbol: '\\leftarrow', name: '左箭头', display: '←' },
    { symbol: '\\rightarrow', name: '右箭头', display: '→' },
    { symbol: '\\Leftarrow', name: '左双箭头', display: '⇐' },
    { symbol: '\\Rightarrow', name: '右双箭头', display: '⇒' },
    { symbol: '\\Leftrightarrow', name: '左右双箭头', display: '⇔' },
    { symbol: '\\updownarrow', name: '上下箭头', display: '↕' },
    { symbol: '\\nearrow', name: '东北箭头', display: '↗' },
    { symbol: '\\searrow', name: '东南箭头', display: '↘' },
    { symbol: '\\swarrow', name: '西南箭头', display: '↙' },
    { symbol: '\\nwarrow', name: '西北箭头', display: '↖' }
])
//#endregion 常量定义

// 方法
const getPlaceholder = () => {
    return props.node.attrs.displayMode
        ? '输入块级公式，例如: \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}'
        : '输入行内公式，例如: E = mc^2'
}

// 渲染后的公式
const renderedFormula = computed(() => {
    const attrs = props.node.attrs;
    let formula = attrs.formula
    if (!formula.trim()) {
        return '<span class="katex-placeholder">输入 LaTeX 公式...</span>'
    }

    if (formulaText.value !== formula) {
        if (isInputDirty.value) { // 编辑框输入        
            isInputDirty.value = false
            formula = formulaText.value //编辑框输入        
            props.updateAttributes({ formula: formulaText.value })
        } else {
            formulaText.value = formula //外部修改同步到输入框  
        }
    }

    const result = renderKaTeX(formula, attrs.displayMode, false)
    const validation = validateLaTeX(formula)
    hasError.value = !validation.valid
    errorMessage.value = validation.error || ''

    return result
})

// 方法：打开编辑器
const openEditor = () => {
    if (!isEditing.value) {
        isEditing.value = true

        setCusor();
    }
}

//光标移动到最后
const setCusor = () => {
    if (formulaInput.value) {
        formulaInput.value.focus()
        formulaInput.value.setSelectionRange(formulaText.length, formulaText.length); //光标移动到最后
        adjustTextareaHeight()
    }
}

const closeEditor = () => {
    isEditing.value = false
}

// 方法：处理点击
const handleClick = (event) => {
    if (!isEditing.value) {
        openEditor()
    }
}

// 方法：处理双击（立即打开编辑器）
const handleDoubleClick = (event) => {
    if (!isEditing.value) {
        openEditor()
    }
}

const handleKeydown = (event) => {
    isInputDirty.value = true // 标记文本框已修改
}

const adjustTextareaHeight = () => {
    if (!formulaInput.value) return

    // 计算新高度
    formulaInput.value.style.height = 'auto'
    textareaHeight.value = Math.max(40, Math.min(formulaInput.value.scrollHeight, 200))
}

const insertSymbol = (symbol) => {
    if (!formulaInput.value) return

    const input = formulaInput.value
    const start = input.selectionStart
    const end = input.selectionEnd
    const attrs = props.node.attrs;
    const textBefore = attrs.formula.substring(0, start)
    const textAfter = attrs.formula.substring(end)

    // 插入符号
    formulaText.value = attrs.formula = textBefore + symbol + textAfter

    // 移动光标到符号后面
    nextTick(() => {
        const newPosition = start + symbol.length
        input.focus()
        input.setSelectionRange(newPosition, newPosition)
        adjustTextareaHeight()
        // 自动更新节点属性
        props.updateAttributes({ formula: formulaText.value })
    })
}

// 点击外部关闭编辑器
const handleClickOutside = (event) => {
    if (mathContainer.value && !mathContainer.value.contains(event.target)) {
        closeEditor()
    }
}

// 生命周期
onMounted(() => {
    document.addEventListener('click', handleClickOutside)

    if (!props.node.attrs.formula) {
        openEditor()
    }

    // 确保编辑器上下文可用
    if (props.editor) {
        console.log('MathComponent mounted with editor context')
    }
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.math-node {
    margin: 8px 0;
    border-radius: 6px;
    transition: all 0.2s ease;
    position: relative;
}

.math-node.math-inline {
    vertical-align: middle;
    margin: 0 2px;
    /* overflow-y: auto; */
    display: inline-block;
    max-height: 350px;
}

.math-node.math-block {
    display: block;
    text-align: center;
    margin: 16px 0;
    padding: 8px 0;
}

/* 编辑模式 */
.math-editor {
    background: var(--ls-tertiary-background-color);
    border: 2px solid var(--ls-active-border-color);
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.math-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--ls-border-color);
}

.math-editor-title {
    font-weight: 600;
    color: var(--ls-primary-text-color);
    font-size: 14px;
}

.math-editor-actions {
    display: flex;
    gap: 4px;
}

.math-action-btn {
    background: var(--ls-primary-background-color);
    color: var(--ls-primary-text-color);
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    border: 1px solid;
    border-radius: 16px;
    width: 24px;
    height: 24px;
}

.math-action-btn:hover {
    background: var(--ls-button-hover-background-color);
}

.math-input-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.math-formula-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--ls-border-color);
    border-radius: 4px;
    background: var(--ls-primary-background-color);
    color: var(--ls-primary-text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.4;
    resize: vertical;
    min-height: 40px;
    max-height: 200px;
    transition: border-color 0.2s;
}

.math-formula-input:focus {
    outline: none;
    border-color: var(--ls-active-border-color);
    box-shadow: 0 0 0 2px rgba(var(--ls-active-border-color-rgb, 33, 150, 243), 0.1);
}

.math-preview {
    background: var(--ls-primary-background-color);
    border: 1px solid var(--ls-border-color);
    border-radius: 4px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-x: auto;
}

.katex-preview {
    font-size: 16px;
}

.katex-placeholder {
    color: var(--ls-secondary-text-color);
    font-style: italic;
}

.math-error {
    margin-top: 8px;
    padding: 6px 10px;
    background: rgba(204, 0, 0, 0.1);
    border: 1px solid rgba(204, 0, 0, 0.3);
    border-radius: 4px;
    color: #cc0000;
    font-size: 12px;
    font-family: monospace;
}

/* 符号工具栏 */
.math-symbols-toolbar {
    margin-top: 4px;
    border-top: 1px solid var(--ls-border-color);
}

.symbols-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
}

.symbols-label {
    font-size: 12px;
    color: var(--ls-secondary-text-color);
    margin-right: 8px;
    min-width: 60px;
}

.symbol-btn {
    padding: 4px 8px;
    border: 1px solid var(--ls-border-color);
    border-radius: 4px;
    background: var(--ls-primary-background-color);
    color: var(--ls-primary-text-color);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    min-width: 32px;
    text-align: center;
}

.symbol-btn:hover {
    background: var(--ls-button-hover-background-color);
    transform: translateY(-1px);
}

.toggle-symbols-btn {
    padding: 6px 12px;
    border: 1px solid var(--ls-border-color);
    border-radius: 4px;
    background: var(--ls-button-background-color);
    color: var(--ls-button-text-color);
    cursor: pointer;
    font-size: 12px;
    width: 100%;
}

.toggle-symbols-btn:hover {
    background: var(--ls-button-hover-background-color);
}

.all-symbols-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    padding: 12px;
    background: var(--ls-tertiary-background-color);
    border-radius: 4px;
    max-height: 150px;
    overflow-y: auto;
}

.symbol-item {
    border: 1px solid var(--ls-border-color);
    border-radius: 4px;
    background: var(--ls-primary-background-color);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
}

.symbol-item:hover {
    background: var(--ls-button-hover-background-color);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.symbol-preview {
    font-size: 16px;
    margin-bottom: 4px;
}

.symbol-code {
    font-size: 10px;
    color: var(--ls-secondary-text-color);
    font-family: monospace;
    word-break: break-all;
}

/* 预览模式 */
.math-preview-mode {
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    border: 1px dashed transparent;
    transition: all 0.2s ease;
}

.math-preview-mode:hover {
    border-color: var(--ls-border-color);
    background: rgba(var(--ls-active-border-color-rgb, 33, 150, 243), 0.05);
}

.math-preview-mode:focus {
    border-color: rgba(51, 109, 216, 0.4);
}

.math-block .math-preview-mode {
    padding: 12px;
}

.katex-rendered {
    display: inline-block;
}

.math-block .katex-rendered {
    display: block;
    margin: 0 auto;
}

.math-error-preview {
    display: inline-block;
    padding: 4px 8px;
    background: rgba(204, 0, 0, 0.1);
    border-radius: 4px;
    color: #cc0000;
    font-size: 12px;
    margin-left: 8px;
}

.math-hint {
    display: inline-block;
    font-size: 11px;
    color: var(--ls-secondary-text-color);
    margin-left: 8px;
    opacity: 0;
    transition: opacity 0.2s;
}

.math-preview-mode:hover .math-hint {
    opacity: 1;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
    .math-editor {
        background: rgba(50, 50, 50, 0.8);
        border-color: #4dabf7;
    }

    .math-formula-input {
        background: #2d2d2d;
        color: #ffffff;
    }

    .symbol-item {
        background: #2d2d2d;
    }

    .all-symbols-grid {
        background: rgba(50, 50, 50, 0.6);
    }

    .math-error {
        background: rgba(255, 80, 80, 0.1);
        border-color: rgba(255, 80, 80, 0.3);
        color: #ff5050;
    }
}
</style>
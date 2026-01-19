<template>
    <!-- 数学相关按钮 -->
    <div class="toolbar-group" :class="[{ 'is-active': editor.isActive('math') }]">
        <button @click="insertMathInline" title="插入行内公式" class="toolbar-btn">
            Σ
        </button>
        <button @click="insertMathBlock" title="插入块级公式" class="toolbar-btn">
            Σ²
        </button>
        <button @click="openMathPalette" title="数学符号面板" class="toolbar-btn">
            <img :src="math" alt="数学符号" />
        </button>
    </div>

    <MathSymbolsPanel v-if="showMathPalette" @insert-symbol="insertSymbolFromPalette"
        @close-math-palette="closeMathPalette" @insert-quick-formula="insertQuickFormula" />
</template>

<script setup>
import { ref } from 'vue'
import MathSymbolsPanel from '../components/MathSymbolsPanel.vue'
import math from "./icon/math.svg"

const props = defineProps({
    editor: {
        type: Object,
        required: true
    }
})

// 新增响应式数据
const showMathPalette = ref(false)

// 数学相关方法
const insertMathInline = (caller, formula) => {
    console.debug("insertMathInline");
    if (!props.editor) return

    props.editor.commands.insertMathInline(formula)
}

const insertMathBlock = (caller, formula) => {
    if (!props.editor) return
    props.editor.commands.insertMathBlock(formula)
}

const openMathPalette = () => {
    showMathPalette.value = true
}

const closeMathPalette = () => {
    showMathPalette.value = false
}

const insertQuickFormula = (formula, displayMode) => {
    if (!props.editor) return

    displayMode ? insertMathBlock(this, formula) : insertMathInline(this, formula)

    closeMathPalette()
}

const insertSymbolFromPalette = (symbol) => {
    console.debug("click", symbol);

    if (!props.editor) return

    if (props.editor.state.selection.empty) {
        return insertMathInline(this, symbol)
    }

    // 如果当前在数学节点中，则插入符号到公式中
    const node = props.editor.state.selection.node;
    if (node.type.name === 'math') {
        const currentFormula = node.attrs.formula || ''
        props.editor.commands.setMathFormula(currentFormula + symbol)
    } else {
        // 否则插入新的公式
        insertMathInline(this, symbol)
    }
}

</script>

<style scoped></style>
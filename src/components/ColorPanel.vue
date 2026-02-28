<template>
    <!-- 文字颜色按钮 -->
    <button @click="toggleTextColorPicker" class="toolbar-btn color-btn" :class="{ 'is-active': showTextColorPicker }"
        title="文字颜色">
        <span class="color-btn-text">A</span>
        <span class="color-preview" :style="{ backgroundColor: currentTextColor }"></span>
    </button>

    <!-- 文字颜色选择面板 -->
    <div v-if="showTextColorPicker" class="color-picker-panel">
        <div class="color-picker-header">
            <span>文字颜色</span>
            <button @click="showTextColorPicker = false" class="close-btn">×</button>
        </div>

        <!-- 预设颜色 -->
        <div class="color-presets">
            <button v-for="color in textColorPresets" :key="color.value" @click="setTextColor(color.value)"
                class="color-preset-item" :style="{ backgroundColor: color.value }" :title="color.name">
                <span v-if="currentTextColor === color.value" class="check-mark">✓</span>
            </button>
        </div>

        <!-- 自定义颜色 -->
        <div class="color-custom">
            <input type="color" v-model="customTextColor" @input="setTextColor(customTextColor)" class="color-input"
                title="自定义颜色">
            <span class="color-custom-label">自定义</span>
        </div>

        <!-- 清除颜色 -->
        <button @click="clearTextColor" class="color-clear-btn">
            清除颜色
        </button>
    </div>

    <!-- 背景颜色按钮 -->
    <button @click="toggleBgColorPicker" class="toolbar-btn" :class="{ 'is-active': showBgColorPicker }" title="背景颜色">
        <span :style="{ backgroundColor: currentBgColor }" class="color-text bg-text">A</span>
    </button>

    <!-- 背景颜色选择面板 -->
    <div v-if="showBgColorPicker" class="color-picker-panel">
        <div class="color-picker-header">
            <span>背景颜色</span>
            <button @click="showBgColorPicker = false" class="close-btn">×</button>
        </div>

        <div class="color-presets">
            <button v-for="color in bgColorPresets" :key="color.value" @click="setBackgroundColor(color.value)"
                class="color-preset-item" :style="{ backgroundColor: color.value }" :title="color.name">
                <span v-if="currentBgColor === color.value" class="check-mark">✓</span>
            </button>
        </div>

        <div class="color-custom">
            <input type="color" v-model="customBgColor" @input="setBackgroundColor(customBgColor)" class="color-input"
                title="自定义颜色">
            <span class="color-custom-label">自定义</span>
        </div>

        <button @click="clearBackgroundColor" class="color-clear-btn">
            清除背景
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
    editor: {
        type: Object,
        required: true
    }
})

// 颜色预设
const textColorPresets = [
    { name: '默认黑色', value: '#000000' },
    { name: '深灰色', value: '#4A5568' },
    { name: '红色', value: '#E53E3E' },
    { name: '橙色', value: '#DD6B20' },
    { name: '黄色', value: '#D69E2E' },
    { name: '绿色', value: '#38A169' },
    { name: '青色', value: '#319795' },
    { name: '蓝色', value: '#3182CE' },
    { name: '靛蓝', value: '#5A67D8' },
    { name: '紫色', value: '#805AD5' },
    { name: '粉色', value: '#D53F8C' },
    { name: '棕色', value: '#8B5A2B' }
]

const bgColorPresets = [
    { name: '无背景', value: 'transparent' },
    { name: '浅灰', value: '#EDF2F7' },
    { name: '浅红', value: '#FED7D7' },
    { name: '浅橙', value: '#FEEBC8' },
    { name: '浅黄', value: '#FEFCBF' },
    { name: '浅绿', value: '#C6F6D5' },
    { name: '浅蓝', value: '#BEE3F8' },
    { name: '浅紫', value: '#E9D8FD' },
    { name: '浅粉', value: '#FED7E2' }
]

// 颜色选择器状态
const showTextColorPicker = ref(false)
const showBgColorPicker = ref(false)
const customTextColor = ref('#3182CE')
const customBgColor = ref('#BEE3F8')
const currentTextColor = ref('#000000')
const currentBgColor = ref('transparent')

onMounted(() => {
    // 初始化当前颜色
    if (!props.editor) return

    currentTextColor.value = props.editor.getAttributes('textStyle')?.color || '#000000'
    currentBgColor.value = props.editor.getAttributes('textStyle')?.backgroundColor || '#cdcdcd'
})

// 颜色相关方法
function toggleTextColorPicker() {
    showTextColorPicker.value = !showTextColorPicker.value
    if (showTextColorPicker.value) {
        showBgColorPicker.value = false
    }
}

function toggleBgColorPicker() {
    showBgColorPicker.value = !showBgColorPicker.value
    if (showBgColorPicker.value) {
        showTextColorPicker.value = false
    }
}

function setTextColor(color) {
    if (!props.editor) return

    // 如果颜色是黑色或默认，可以不用设置
    if (color === '#000000') {
        props.editor.chain().focus().unsetColor().run()
    } else {
        props.editor.chain().focus().setColor(color).run()
    }

    currentTextColor.value = color
    showTextColorPicker.value = false
}

function setBackgroundColor(color) {
    if (!props.editor) return

    if (color === 'transparent') {
        props.editor.chain().focus().unsetBackgroundColor().run()
    } else {
        props.editor.chain().focus().setBackgroundColor(color).run()
    }

    currentBgColor.value = color
    showBgColorPicker.value = false
}

function clearTextColor() {
    if (!props.editor) return
    props.editor.chain().focus().unsetColor().run()
    showTextColorPicker.value = false
}

function clearBackgroundColor() {
    if (!props.editor) return
    props.editor.chain().focus().unsetMark('textStyle', 'backgroundColor').run()
    showBgColorPicker.value = false
}

</script>

<style scoped>
.color-btn {
    flex-flow: column;
}

.color-btn-text {
    font-size: 18px;
    height: 18px;
}

.color-preview {
    width: 16px;
    height: 2px;
    display: inline-block;
}

.bg-text {
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid var(--ls-border-color, #ccc);
}

/* 颜色选择器面板 */
.color-picker-panel {
    position: absolute;
    top: 100%;
    left: 0;
    width: 240px;
    background: var(--ls-primary-background-color, white);
    border: 1px solid var(--ls-border-color, #dee2e6);
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    margin-top: 5px;
    padding: 12px;
    animation: fadeIn 0.2s ease;
}

.color-picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ls-primary-text-color, #333);
}

.close-btn {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #666;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.close-btn:hover {
    background: var(--ls-tertiary-background-color, #f0f0f0);
}

/* 预设颜色网格 */
.color-presets {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
    margin-bottom: 12px;
}

.color-preset-item {
    aspect-ratio: 1;
    border: 1px solid var(--ls-border-color, #dee2e6);
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    transition: transform 0.2s;
}

.color-preset-item:hover {
    transform: scale(1.1);
    border-color: #4a90e2;
}

.check-mark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    font-size: 14px;
}

/* 自定义颜色 */
.color-custom {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 8px 0;
    border-top: 1px solid var(--ls-border-color, #eee);
    border-bottom: 1px solid var(--ls-border-color, #eee);
}

.color-input {
    width: 40px;
    height: 40px;
    border: 1px solid var(--ls-border-color, #dee2e6);
    border-radius: 4px;
    cursor: pointer;
    padding: 2px;
}

.color-custom-label {
    font-size: 13px;
    color: var(--ls-secondary-text-color, #666);
}

/* 清除按钮 */
.color-clear-btn {
    width: 100%;
    padding: 8px;
    background: var(--ls-tertiary-background-color, #f8f9fa);
    border: 1px solid var(--ls-border-color, #dee2e6);
    border-radius: 4px;
    font-size: 13px;
    color: var(--ls-primary-text-color, #333);
    cursor: pointer;
    transition: all 0.2s;
}

.color-clear-btn:hover {
    background: var(--ls-secondary-background-color, #e9ecef);
}

/* 颜色指示器 */
.color-indicator {
    font-size: 12px;
    color: #4a90e2;
    background: rgba(74, 144, 226, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
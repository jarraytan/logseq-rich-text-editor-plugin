<template>
    <div v-if="visible" class="logseq-rich-text-editor-overlay" @click="closeOnOverlay">
        <div id="rich-text-editor-container" @click.stop>
            <RichTextEditor :visible="visible" @save="handleSave" @cancel="handleCancel" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import RichTextEditor from './components/RichTextEditor.vue'

const visible = ref(false)

const closeOnOverlay = () => {
    visible.value = false
    logseq.hideMainUI()
}

const handleSave = (content) => {
    console.log('内容已保存:', content)
    visible.value = false
    logseq.hideMainUI()
}

const handleCancel = () => {
    visible.value = false
    logseq.hideMainUI()
}

// 打开编辑器
async function openEditor() {
    visible.value = true
}

// 关闭编辑器
function closeModal() {
    visible.value = false
}

// 暴露方法给全局使用
window.richTextEditor = {
    open: openEditor,
    close: closeModal
}

</script>

<style scoped>
.logseq-rich-text-editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99998;
    display: flex;
    align-items: center;
    justify-content: center;
}

#rich-text-editor-container {
    position: relative;
    z-index: 99999;
}
</style>
<template>
  <div class="rich-text-editor">
    <div class="editor-header">
      <h3>富文本编辑器</h3>
      <div class="header-actions">
        <button @click="handleCancel" class="btn btn-cancel">x</button>
      </div>
    </div>

    <!-- 主工具条 -->
    <Toolbar :editor="editor" />

    <EditorContent :editor="editor" class="prose-mirror-wrapper" />

    <div class="editor-footer">
      <button @click="handleSave" class="btn btn-save">保存</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { MathExtension, convertHTMLToMarkdown, convertMarkdownToHTML } from '../extensions/MathExtension'
import Toolbar from './Toolbar.vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['save', 'cancel', 'preview'])

const currentBlock = ref(null)

// 初始化Tiptap编辑器
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6]
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
    }),
    MathExtension.configure({
      editor: null //后面会自动传递
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm focus:outline-none max-w-none',
      spellcheck: 'false',
    },
  },
  content: "", // 初始化内容
  onUpdate: ({ editor }) => {
    // 可以在这里添加实时预览逻辑
    //TODO 实时预览

    emit('preview', editor.getHTML())
  },
  // 添加 onTransaction 钩子确保节点视图更新
  onTransaction: ({ transaction, editor }) => {
    // 确保数学节点在事务后更新
    if (transaction.docChanged) {
      // 触发视图更新
      editor.view.updateState(editor.state)
    }
  }
})

// 加载当前块内容
const loadCurrentBlock = async () => {
  try {
    const block = await logseq.Editor.getCurrentBlock()
    if (block) {
      currentBlock.value = block

      if (editor.value) {
        // 将Markdown转换为HTML
        const html = await convertMarkdownToHTML(block.content)
        console.log('加载块内容:', html)
        editor.value.commands.setContent(html)
      }
    }
  } catch (error) {
    console.error('加载块失败:', error)
  }
}

// 保存内容
const handleSave = async () => {
  if (!editor.value || !currentBlock.value) return

  try {
    const html = editor.value.getHTML()
    const markdown = await convertHTMLToMarkdown(html)

    // 更新块内容
    await logseq.Editor.updateBlock(currentBlock.value.uuid, markdown)

    // 关闭编辑器
    logseq.hideMainUI()

    emit('save', { markdown, html })
  } catch (error) {
    console.error('保存失败:', error)
    logseq.UI.showMsg('保存失败', 'error')
  }
}

// 取消编辑
const handleCancel = () => {
  emit('cancel')
  logseq.hideMainUI()
}

watch(() => props.visible, async (newVisible, oldvisible) => {
  if (newVisible) {
    await loadCurrentBlock()
  }
}, { immediate: true })

// 清理
onUnmounted(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
.rich-text-editor {
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #4a90e2;
  color: white;
  border-bottom: 1px solid #e0e0e0;
}

.editor-header h3 {
  padding: 4px;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save {
  background: #4caf50;
  color: white;
}

.btn-save:hover {
  background: #43a047;
}

.btn-cancel {
  color: rgb(255, 255, 255);
  position: absolute;
  right: 2px;
  top: 2px;
  width: 24px;
  height: 24px;
  background: rgb(244, 67, 54);
  padding: 0px;
}

.btn-cancel:hover {
  background: #e53935;
}

.editor-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 400px;
}

.editor-footer {
  padding: 12px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  color: #666;
  font-size: 12px;
  text-align: right;
  z-index: 10;
}

.prose-mirror-wrapper {
  min-height: 300px;
  padding: 16px;
  outline: none;
  overflow-y: auto;
}

.prose-mirror-wrapper:focus-within {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
}

.prose-mirror-wrapper .ProseMirror p:nth-last-child {
  display: none;
}
</style>
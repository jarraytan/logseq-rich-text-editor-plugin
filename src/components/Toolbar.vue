<template>
  <div class="toolbar" v-if="editor">
    <div class="toolbar-group">
      <button @click="editor.chain().focus().toggleBold().run()"
        :class="['toolbar-btn', { 'is-active': editor.isActive('bold') }]" title="加粗 (Ctrl+B)">
        <strong>B</strong>
      </button>

      <button @click="editor.chain().focus().toggleItalic().run()"
        :class="['toolbar-btn', { 'is-active': editor.isActive('italic') }]" title="斜体 (Ctrl+I)">
        <em>I</em>
      </button>

      <button @click="editor.chain().focus().toggleStrike().run()"
        :class="['toolbar-btn', { 'is-active': editor.isActive('strike') }]" title="删除线">
        <s>S</s>
      </button>

      <button @click="editor.chain().focus().toggleCode().run()"
        :class="['toolbar-btn', { 'is-active': editor.isActive('code') }]" title="代码块">
        <img :src="code" alt="代码块" />
      </button>
    </div>

    <div class="toolbar-group">
      <button v-for="level in [1, 2, 3]" :key="level" @click="toggleHeading(level)"
        :class="['toolbar-btn', { 'is-active': editor.isActive('heading', { level }) }]" :title="`标题 ${level}`">
        H{{ level }}
      </button>
    </div>

    <div class="toolbar-group">
      <button @click="editor.chain().focus().toggleBulletList().run()"
        :class="['toolbar-btn', { 'is-active': editor.isActive('bulletList') }]" title="无序列表">
        <img :src="list" alt="无序列表" />
      </button>

      <button @click="editor.chain().focus().toggleOrderedList().run()"
        :class="['toolbar-btn', { 'is-active': editor.isActive('orderedList') }]" title="有序列表">
        <img :src="list2" alt="有序列表" />
      </button>

      <button @click="editor.chain().focus().toggleBlockquote().run()"
        :class="['toolbar-btn', { 'is-active': editor.isActive('blockquote') }]" title="引用">
        ❝
      </button>
    </div>

    <div class="toolbar-group">
      <button @click="editor.chain().focus().setHorizontalRule().run()" class="toolbar-btn" title="分割线">
        ―
      </button>

      <button @click="addLink" :class="['toolbar-btn', { 'is-active': editor.isActive('link') }]" title="添加链接">
        <img :src="link" alt="超链接" />
      </button>

      <button @click="addImage" class="toolbar-btn" title="插入图片">
        <img :src="img" alt="图片" />
      </button>
    </div>

    <!-- Latex -->
    <Latex :editor="editor" />

    <!-- 撤销和重做 -->
    <div class="toolbar-group">
      <button @click="editor.chain().focus().undo().run()" class="toolbar-btn" title="撤销 (Ctrl+Z)">
        ↶
      </button>

      <button @click="editor.chain().focus().redo().run()" class="toolbar-btn" title="重做 (Ctrl+Y)">
        ↷
      </button>
    </div>
  </div>
</template>

<script setup>

import Latex from './LatexToolbar.vue'
import list from "./icon/list.svg"
import list2 from "./icon/list2.svg"
import link from "./icon/link.svg"
import img from "./icon/img.svg"
import code from "./icon/code.svg"

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

const toggleHeading = (level) => {
  props.editor.chain().focus().toggleHeading({ level }).run()
}

const addLink = () => {
  const url = window.prompt('输入链接地址:')
  if (url) {
    // 如果已经有选中文本，直接添加链接
    if (props.editor.state.selection.empty) {
      props.editor.chain().focus().setLink({ href: url }).insertContent(url).run()
    } else {
      props.editor.chain().focus().setLink({ href: url }).run()
    }
  }
}

const addImage = () => {
  const url = window.prompt('输入图片地址:')
  if (url) {
    props.editor.chain().focus().setImage({ src: url }).run()
  }
}
</script>

<style>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar-group {
  display: flex;
  gap: 2px;
  padding-right: 4px;
  border-right: 1px solid #e0e0e0;
}

.toolbar-group.is-active {
  border-color: #4a90e2;
  border: 1px dashed;
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-btn {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  color: #333;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.toolbar-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.toolbar-btn.is-active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.toolbar-btn strong {
  font-weight: 700;
}

.toolbar-btn em {
  font-style: italic;
}

.toolbar-btn s {
  text-decoration: line-through;
}

.toolbar-btn code {
  font-family: monospace;
}

.toolbar-btn img {
  padding: 4px;
}
</style>
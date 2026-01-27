<template>
  <div v-if="_visible" class="custom-prompt-rt">
    <div>
      <h3>
        {{ _title }}
      </h3>
      <input ref="inputBox" type="text" :placeholder="_placeholder" autofocus="true"
        @keydown="handleKeydown" v-model="_text" />
      <div class="custom-prompt-rt-footer">
        <button class="custom-prompt-rt-cancel" @click="handleCancel">取消</button>
        <button class="custom-prompt-rt-confirm" @click="handleConfirm">确定</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'

const inputBox = ref(null);
const emit = defineEmits(['ok', 'cancel']);

const _text = ref(''); //输入文本
const _visible = ref(false); //是否显示提示框
const _title = ref(''); //提示框标题
const _defaultValue = ref(''); //默认值
const _placeholder = ref(''); //占位符

// 8. 清理函数
const removeModal = () => {
  _visible.value = false;
};

// 4. 处理确认
const handleConfirm = () => {
  removeModal();
  emit('ok', _text.value);
  resolve(_text.value || _defaultValue.value);
};

// 5. 处理取消
const handleCancel = () => {
  removeModal();
  emit('cancel');
  reject(null);
};

const handleKeydown = (e) => {
  if (e.key === 'Enter') handleConfirm();
  if (e.key === 'Escape') handleCancel();
  e.stopPropagation(); // 防止事件冒泡到编辑器
};

let resolve;
let reject;

// 创建一个自定义的模态输入框，适用于Logseq环境
const open = async (
  title = "请输入",
  defaultValue = "",
  placeholder = ""
) => {
  _title.value = title || '提示';
  _defaultValue.value = defaultValue || '';
  _placeholder.value = placeholder || '';
  _visible.value = true;
  _text.value = defaultValue || ''; // 设置默认值 

  setTimeout(() => {
    if (inputBox.value) {
      inputBox.value.focus();
    }
  }, 10);

  return new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
};


// 暴露方法给父组件,使用传统链式调用
defineExpose({
  open
});
</script>
<style scoped>
.custom-prompt-rt {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-prompt-rt>div {
  background: var(--ls-primary-background-color, white);
  border-radius: 8px;
  padding: 24px;
  min-width: 50vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.custom-prompt-rt>div>h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--ls-primary-text-color, black);
}

.custom-prompt-rt input {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 2px solid var(--ls-border-color, #ddd);
  border-radius: 4px;
  font-size: 16px;
  background: var(--ls-secondary-background-color, #f5f5f5);
  color: var(--ls-primary-text-color, black);
}

.custom-prompt-rt-cancel {
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.custom-prompt-rt-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
}

.custom-prompt-rt-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
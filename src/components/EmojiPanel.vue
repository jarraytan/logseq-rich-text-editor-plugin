<template>
    <!-- Emoji选择器面板 -->
    <div class="emoji-picker" ref="emojiPickerRef">
        <div class="emoji-picker-header">
            <input type="text" v-model="emojiSearch" placeholder="搜索Emoji..." class="emoji-search" @keydown.esc="close">
            <button @click="close" class="emoji-close">×</button>
        </div>

        <div class="emoji-categories">
            <button v-for="(icon, cat) in emojiCategories" :key="cat" @click="selectedCategory = cat"
                :class="['category-btn', { active: selectedCategory === cat }]" :title="cat">
                {{ icon }}
            </button>
        </div>

        <div class="emoji-grid">
            <button v-for="(tip, emoji) in filteredEmojis" :key="emoji" @click="insert(emoji)" class="emoji-item"
                :title="tip">
                {{ emoji }}
            </button>
        </div>
    </div>
</template>

<script setup>

import { ref, computed, defineEmits } from 'vue';
import { emojiCategories, emojiList } from '../extensions/emoji.js'

const emit = defineEmits(['insertEmoji', 'closePicker']);

// Emoji选择器状态
const emojiSearch = ref("");
const selectedCategory = ref("情感");

// 过滤Emoji
const filteredEmojis = computed(() => {
    const searchTerm = emojiSearch.value.toLowerCase().trim();
    const categoryEmojis = emojiList[selectedCategory.value] || {};

    if (!searchTerm) {
        return categoryEmojis;
    }

    const results = {};
    for (const category in emojiList) {
        const categoryEmojis = emojiList[category];
        for (const emoji in categoryEmojis) {
            if (
                emoji.toLowerCase().includes(searchTerm) ||
                categoryEmojis[emoji].includes(searchTerm)
            ) {
                results[emoji] = categoryEmojis[emoji];
            }
        }
    }
    return results;
});


// 插入Emoji
const insert = (emoji) => {
    emit('insertEmoji', emoji);
};

const close = () => {
    emit('closePicker');
};

</script>

<style scoped>
/* Emoji按钮样式 */
.emoji-group {
    position: relative;
}

.emoji-btn {
    font-size: 18px;
    padding: 6px 12px;
}

.emoji-icon {
    display: inline-block;
    animation: none;
}

/* Emoji选择器 */
.emoji-picker {
    position: absolute;
    top: 32px;
    left: 0;
    width: 420px;
    max-height: 420px;
    background: var(--ls-primary-background-color, white);
    border: 1px solid var(--ls-border-color, #dee2e6);
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.emoji-picker-header {
    display: flex;
    padding: 10px;
    background: var(--ls-secondary-background-color, #f8f9fa);
    border-bottom: 1px solid var(--ls-border-color, #dee2e6);
    gap: 8px;
}

.emoji-search {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid var(--ls-border-color, #ced4da);
    border-radius: 4px;
    font-size: 13px;
    outline: none;
}

.emoji-search:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.emoji-close {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--ls-primary-text-color, #666);
    padding: 0 5px;
    border-radius: 4px;
}

.emoji-close:hover {
    background: var(--ls-tertiary-background-color, #e9ecef);
}

.emoji-categories {
    display: flex;
    gap: 5px;
    padding: 5px;
    background: var(--ls-secondary-background-color, #f8f9fa);
    border-bottom: 1px solid var(--ls-border-color, #dee2e6);
    overflow-x: auto;
}

.category-btn {
    padding: 5px 10px;
    border: 1px solid transparent;
    border-radius: 4px;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
}

.category-btn:hover {
    background: var(--ls-tertiary-background-color, #e9ecef);
    border-color: var(--ls-border-color, #ced4da);
}

.category-btn.active {
    background: #4a90e2;
    color: white;
    border-color: #4a90e2;
}

.emoji-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 5px;
    padding: 10px;
    overflow-y: auto;
    max-height: 200px;
    background: var(--ls-primary-background-color, white);
}

.emoji-item {
    padding: 5px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.emoji-item:hover {
    background: var(--ls-tertiary-background-color, #e9ecef);
    border-color: var(--ls-border-color, #ced4da);
    transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .emoji-picker {
        width: 280px;
    }

    .emoji-grid {
        grid-template-columns: repeat(6, 1fr);
    }

    .editor-footer {
        flex-direction: column;
        gap: 5px;
        text-align: center;
    }
}

/* 动画 */
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

.emoji-picker {
    animation: fadeIn 0.2s ease;
}
</style>
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()], // 使用 Vue 插件来解析 .vue 文件
  test: {
    environment: "happy-dom", // 或 'jsdom'，用于模拟浏览器环境
    globals: true, // 可选的：启用后，describe、it、expect 等无需导入
  },
});

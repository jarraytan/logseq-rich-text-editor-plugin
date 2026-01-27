import "@logseq/libs";
import { createApp } from "vue";
import App from "./App.vue";
import "./styles/main.css";
import "./styles/katex.css";

const APP_KEY = "rich-text-editor";

function createModel() {
  return {
    showEditor() {
      const block = logseq.Editor.getCurrentBlock();
      if (block) {
        logseq.showMainUI();
        window.richTextEditor.open(block);
      } else {
        logseq.UI.showMsg("请先选择一个块", "warning");
      }
    },
  };
}

function main() {
  console.log(`Plugin: ${APP_KEY} loaded`);

  logseq.provideModel(createModel());

  console.log(`Registering ${APP_KEY}...`);

  // 注册工具栏按钮
  logseq.App.registerUIItem("toolbar", {
    key: APP_KEY,
    template: `
     <a data-on-click="showEditor" class="button" style="font-size: 20px">
      <!-- <i class="ti ti-edit" style="font-size: 20px;"></i>     -->
      <svg style="width:22px;height:22px;vertical-align: middle;" viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <path id="svg_2" fill="#0594D1" d="m49.67568,24.99999l498.16216,0a27.67568,27.67568 0 0 1 27.67567,27.67568l0,387.45946a27.67568,27.67568 0 0 1 -27.67567,27.67567l-498.16216,0a27.67568,27.67568 0 0 1 -27.67568,-27.67567l0,-387.45946a27.67568,27.67568 0 0 1 27.67568,-27.67568zm0,27.67568l0,387.45946l498.16216,0l0,-387.45946l-498.16216,0z"/>
        <path id="svg_3" fill="#0594D1" d="m22,163.37837l553.51351,0l0,-27.67567l-553.51351,0l0,27.67567z"/>
        <path id="svg_4" fill="#0594D1" d="m185.16656,246.68215a11.09795,11.09795 0 0 0 -1.01478,-15.90428a11.70681,11.70681 0 0 0 -16.25484,0.9871l-59.98242,66.42162a11.08872,11.08872 0 0 0 0.48894,15.42457l59.98242,58.64476a11.71604,11.71604 0 0 0 16.29174,0a11.08872,11.08872 0 0 0 0,-15.93196l-52.32547,-51.1631l52.81441,-58.48793l0,0.00922zm227.1804,0a11.09795,11.09795 0 0 1 1.01477,-15.90428a11.70681,11.70681 0 0 1 16.25485,0.9871l59.98241,66.42162a11.08872,11.08872 0 0 1 -0.48893,15.42457l-59.98242,58.64476a11.71604,11.71604 0 0 1 -16.29175,0a11.08872,11.08872 0 0 1 0,-15.93196l52.32548,-51.1631l-52.81441,-58.48793l0,0.00922zm-74.86271,-48.65383l-110.7027,193.72973a13.83784,13.83784 0 1 0 24.02249,13.72713l110.7027,-193.72973a13.83784,13.83784 0 1 0 -24.02249,-13.72713z"/>
      </svg>
     </a>
    `,
  });

  // 监听Esc键关闭编辑器
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      logseq.hideMainUI();
    }
  });

  console.log("=== 插件调试信息 ===");

  // 点击外部关闭
  // document.addEventListener("click", (e) => {
  //   if (!e.target.closest?.("#rich-text-editor-container")) {
  //     logseq.hideMainUI();
  //   }
  // });

  // 创建Vue应用
  const appContainer = document.createElement("div");
  appContainer.id = "logseq-rich-text-editor-overlay";
  document.body.appendChild(appContainer);

  const app = createApp(App);
  app.mount(appContainer);
}

logseq.ready().then(main).catch(console.error);

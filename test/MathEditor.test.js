import { describe, it, expect, beforeEach, vi } from "vitest"; // 从 vitest 导入
import { mount } from "@vue/test-utils"; // 改用 @vue/test-utils 挂载
import { nextTick } from "vue";
import MathComponent from "../src/components/MathEditor.vue"; // 导入要测试的组件

// 全局模拟对象可以放在顶部
vi.mock("katex", () => ({
  default: {
    renderToString: vi
      .fn()
      .mockReturnValue('<span class="katex">Rendered formula</span>'),
  },
}));

// 模拟全局的 window.logseq
const mockLogseq = {
  Editor: {
    getCurrentPage: vi.fn(),
    appendBlockInPage: vi.fn(),
  },
};
global.window.logseq = mockLogseq;

describe("MathComponent", () => {
  let wrapper;

  beforeEach(() => {
    // 使用 mount 挂载组件
    wrapper = mount(MathComponent, {
      props: {
        node: {
          attrs: { formula: "E = mc^2", displayMode: false },
        },
        // ... 其他 nodeViewProps
      },
    });
  });

  it("renders formula", () => {
    // 使用 wrapper.find 和 wrapper.text() 进行断言
    expect(wrapper.text()).toContain("Rendered formula");
  });

  it("enters edit mode on click", async () => {
    await wrapper.trigger("click");
    // 断言编辑器的某个元素出现了
    expect(wrapper.find(".math-editor").exists()).toBe(true);
  });
});

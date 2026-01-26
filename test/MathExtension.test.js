import { describe, it, expect, beforeEach } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
  convertHTMLToMarkdown,
  convertMarkdownToHTML,
  MathExtension,
} from "../src/extensions/MathExtension";

describe("MathExtension", () => {
  let editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [
        StarterKit.configure({
          // 禁用可能干扰的扩展，如CodeBlock
          codeBlock: false,
        }),
        MathExtension,
      ],
      content: "<p>Start</p>",
    });
  });

  it("should allow inserting a math node", () => {
    // 执行命令插入数学公式
    editor.chain().focus().insertMathInline().run();

    // 检查HTML中是否包含了我们定义的 math 节点
    const html = editor.getHTML();
    // 检查是否有 math 相关的数据属性或类名
    expect(html).toContain('data-type="math"');
    // 或者更宽松的检查：包含数学节点
    expect(html).toMatch(/math/);
  });

  it("should have the math schema registered", () => {
    // 检查编辑器的 schema 中是否注册了我们的节点类型
    const nodeTypes = Object.keys(editor.schema.nodes);
    expect(nodeTypes).toContain("math");
  });

  it("should respond to keyboard shortcuts", () => {
    // 可以模拟键盘事件来测试快捷键
    // 这里简化地检查命令是否存在
    expect(editor.commands.insertMathInline).toBeDefined();
    expect(editor.commands.insertMathBlock).toBeDefined();
  });

  it("test convertHtmlToMarkdown (math-block)", () => {
    const htmlString = `<div data-formula="\\begin{pmatrix} a &amp; b \\\\ c &amp; d \\end{pmatrix}" data-display-mode="true" class="math-block" data-type="math"></div><p></p>`;
    const md = convertHTMLToMarkdown(htmlString);
    console.log("math-block", md);
    expect(md).toBe("\n$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$\n");
  });

  it("test convertHtmlToMarkdown (math-inline)", () => {
    const htmlString = `<div data-formula="\\begin{pmatrix} a &amp; b \\\\ c &amp; d \\end{pmatrix}" data-display-mode="false" class="math-inline" data-type="math"></div><p></p>`;
    const md = convertHTMLToMarkdown(htmlString);
    console.log("math-inline", md);
    expect(md).toBe("$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$");
  });

  it("test convertHtmlToMarkdown (math-inline)", () => {
    const md = `\$\\alpha\\beta\\gamma\\omicron\$\$\\delta\$\$\\delta\\sigma\$\$\\alpha\$`;
    const html = convertMarkdownToHTML(md);
    console.log("html-math-inline", html);
    expect(html).toBe(
      `<span data-formula="\\alpha\\beta\\gamma\\omicron" data-display-mode="false" class="math-inline" data-type="math"></span><span data-formula="\\delta" data-display-mode="false" class="math-inline" data-type="math"></span><span data-formula="\\delta\\sigma" data-display-mode="false" class="math-inline" data-type="math"></span><span data-formula="\\alpha" data-display-mode="false" class="math-inline" data-type="math"></span>`,
    );

    expect(convertMarkdownToHTML(`\$\\alpha\$`)).toBe(
      `<span data-formula="\\alpha" data-display-mode="false" class="math-inline" data-type="math"></span>`,
    );

    expect(
      convertMarkdownToHTML(
        "$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$",
      ),
    ).toBe(
      `<span data-formula="\\begin{pmatrix} a &amp; b \\\\ c &amp; d \\end{pmatrix}" data-display-mode="false" class="math-inline" data-type="math"></span>`,
    );
  });

  it("test convertHtmlToMarkdown (math-block)", () => {
    const md = "\n$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$\n";
    const html = convertMarkdownToHTML(md);
    console.log("html-block", html);
    expect(html).toBe(
      `<div data-formula="\\begin{pmatrix} a &amp; b \\\\ c &amp; d \\end{pmatrix}" data-display-mode="true" class="math-block" data-type="math"></div>`,
    );
  });

  it("test code-block", () => {
    const md = "```\n\$\\alpha\\beta\\gamma\\omicron\$\$\\delta\$\$\\delta\\sigma\$\$\\alpha\$\n```";
    const html = convertMarkdownToHTML(md);
    console.log("html-code-block", html);
    expect(html).toBe(
      `<pre><code>\$\\alpha\\beta\\gamma\\omicron\$\$\\delta\$\$\\delta\\sigma\$\$\\alpha\$</code></pre>`,
    );
  });
});

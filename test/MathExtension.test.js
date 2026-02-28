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

  it("test convertMarkdownToHTML (math-inline)", () => {
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

  it("test convertMarkdownToHTML (math-block)", () => {
    const md = "\n$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$\n";
    const html = convertMarkdownToHTML(md);
    console.log("html-block", html);
    expect(html).toBe(
      `<div data-formula="\\begin{pmatrix} a &amp; b \\\\ c &amp; d \\end{pmatrix}" data-display-mode="true" class="math-block" data-type="math"></div>`,
    );
  });

  it("test code-block", () => {
    const md =
      "```\n\$\\alpha\\beta\\gamma\\omicron\$\$\\delta\$\$\\delta\\sigma\$\$\\alpha\$\n```";
    const html = convertMarkdownToHTML(md);
    console.log("html-code-block", html);
    expect(html).toBe(
      `<pre><code>\$\\alpha\\beta\\gamma\\omicron\$\$\\delta\$\$\\delta\\sigma\$\$\\alpha\$</code></pre>`,
    );
  });

  it("test convertHtmlToMarkdown (image)", () => {
    const htmlString = `<p><img src="https://www.baidu.com/img/flexible/logo/pc/result.png"></p>`;
    const md = convertHTMLToMarkdown(htmlString);
    console.log("image", md);
    expect(md).toBe(
      " ![](https://www.baidu.com/img/flexible/logo/pc/result.png)\n",
    );
  });

  it("test convertHtmlToMarkdown (image with alt)", () => {
    const htmlString2 = `<p><img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="百度logo"></p>`;
    const md2 = convertHTMLToMarkdown(htmlString2);
    console.log("image", md2);
    expect(md2).toBe(
      " ![百度logo](https://www.baidu.com/img/flexible/logo/pc/result.png)\n",
    );
  });

  it("test convertHtmlToMarkdown (many images)", () => {
    const htmlString2 = `<p><img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt=""><img src="https://www.baidu.com/img/flexible/logo/pc/result.png"></p>`;
    const md2 = convertHTMLToMarkdown(htmlString2);
    console.log("image", md2);
    expect(md2).toBe(
      " ![](https://www.baidu.com/img/flexible/logo/pc/result.png)  ![](https://www.baidu.com/img/flexible/logo/pc/result.png)\n",
    );

    const htmlString = `<p><img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="">img<img src="https://www.baidu.com/img/flexible/logo/pc/result.png"></p>`;
    const md = convertHTMLToMarkdown(htmlString);
    console.log("image", md);
    expect(md).toBe(
      " ![](https://www.baidu.com/img/flexible/logo/pc/result.png) img ![](https://www.baidu.com/img/flexible/logo/pc/result.png)\n",
    );
  });

  it("test convertMarkdownToHTML (image)", () => {
    const md = " ![](https://www.baidu.com/img/flexible/logo/pc/result.png)\n";
    const htmlString = convertMarkdownToHTML(md);
    console.log("image", htmlString);
    expect(htmlString).toBe(
      `<img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="">`,
    );
  });

  it("test convertMarkdownToHTML (image with alt)", () => {
    const md =
      " ![百度logo](https://www.baidu.com/img/flexible/logo/pc/result.png)\n";
    const htmlString = convertMarkdownToHTML(md);
    console.log("image", htmlString);
    expect(htmlString).toBe(
      `<img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="百度logo">`,
    );
  });

  it("test convertMarkdownToHTML (many images)", () => {
    const md =
      " ![](https://www.baidu.com/img/flexible/logo/pc/result.png)  ![](https://www.baidu.com/img/flexible/logo/pc/result.png)\n";
    const htmlString = convertMarkdownToHTML(md);
    console.log("image", htmlString);
    expect(htmlString).toBe(
      `<img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt=""><img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="">`,
    );

    const md2 =
      " ![](https://www.baidu.com/img/flexible/logo/pc/result.png) baidu ![](https://www.baidu.com/img/flexible/logo/pc/result.png)\n";
    const htmlString2 = convertMarkdownToHTML(md2);
    console.log("image", htmlString2);
    expect(htmlString2).toBe(
      `<img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="">baidu<img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="">`,
    );
  });

  it("test convertMarkdownToHTML (image and link)", () => {
    const md =
      " ![baidu](https://www.baidu.com/img/flexible/logo/pc/result.png) [baidu](https://www.baidu.com)";
    const htmlString = convertMarkdownToHTML(md);
    console.log("image", htmlString);
    expect(htmlString).toBe(
      `<img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="baidu"><a href="https://www.baidu.com">baidu</a>`,
    );
  });

  it("test convertHtmlToMarkdown (image and link)", () => {
    const htmlString2 = `<img src="https://www.baidu.com/img/flexible/logo/pc/result.png" alt="baidu"><a href="https://www.baidu.com">baidu</a>`;
    const md2 = convertHTMLToMarkdown(htmlString2);
    console.log("image", md2);
    expect(md2).toBe(
      " ![baidu](https://www.baidu.com/img/flexible/logo/pc/result.png) [baidu](https://www.baidu.com)",
    );
  });

  it("test convertHtmlToMarkdown (orderlist)", () => {
    const htmlString2 = `<ol><li><p>有序列表1</p></li><li><p>有序列表2</p></li><li><p>有序列表3</p></li></ol><p></p>`;
    const md2 = convertHTMLToMarkdown(htmlString2);
    console.log("orderlist", md2);
    expect(md2).toBe("1. 有序列表1\n2. 有序列表2\n3. 有序列表3\n");

    const htmlString = `<ol><li>有序列表1</li><li>有序列表2</li><li>有序列表3</li></ol>`;
    const md = convertHTMLToMarkdown(htmlString);
    console.log("orderlist", md);
    expect(md).toBe("1. 有序列表1\n2. 有序列表2\n3. 有序列表3\n");
  });

  it("test convertMarkdownToHTML (orderlist)", () => {
    const md = "1. 有序列表1\n2. 有序列表2\n3. 有序列表3\n";
    const htmlString = convertMarkdownToHTML(md);
    console.log("orderlist", htmlString);
    expect(htmlString).toBe(
      `<ol><li>有序列表1</li><li>有序列表2</li><li>有序列表3</li></ol><br>`,
    );
  });

  it("test convertHtmlToMarkdown (code block)", () => {
    const htmlString2 = `<pre><code class="language-javascript">var a = 0;</code></pre><p></p>`;
    const md2 = convertHTMLToMarkdown(htmlString2);
    console.log("code-block", md2);
    expect(md2).toBe("\n```javascript\nvar a = 0;\n```\n");
  });

  it("test convertMarkdownToHTML (code block)", () => {
    const md = "```javascript\nvar a = 0;\n```";
    const htmlString = convertMarkdownToHTML(md);
    console.log("code block", htmlString);
    expect(htmlString).toBe(
      `<pre><code class="language-javascript">var a = 0;</code></pre>`,
    );
  });

  it("test convertMarkdownToHTML (code)", () => {
    const md = "`var a = 0;`";
    const htmlString = convertMarkdownToHTML(md);
    console.log("code", htmlString);
    expect(htmlString).toBe(`<code>var a = 0;</code>`);
  });

  it("test convertHtmlToMarkdown (code)", () => {
    const htmlString2 = `<code>var a = 0;</code>`;
    const md2 = convertHTMLToMarkdown(htmlString2);
    console.log("code", md2);
    expect(md2).toBe("`var a = 0;`");
  });

  it("test underline", () => {
    const htmlString = `<ul><li>text<u>this is a underline.</u>text</li></ul>`;
    const md = convertHTMLToMarkdown(htmlString);
    console.log("underline", md);
    expect(md).toBe(`- text <ins>this is a underline.</ins>text\n`);
    const htmlString2 = `<u>this is a underline.</u>`;
    const md2 = convertHTMLToMarkdown(htmlString2);
    console.log("underline", md2);
    expect(md2).toBe(` <ins>this is a underline.</ins>`);
  });

  it("test convertMarkdownToHTML (underline)", () => {
    const md = "- text <ins>this is a underline.</ins> text\n";
    const htmlString = convertMarkdownToHTML(md);
    console.log("underline", htmlString);
    expect(htmlString).toBe(
      `<ul><li>text<u>this is a underline.</u>text</li></ul><br>`,
    );
    const md2 = " <ins>this is a underline.</ins> ";
    const htmlString2 = convertMarkdownToHTML(md2);
    console.log("underline", htmlString2);
    expect(htmlString2).toBe(`<p><u>this is a underline.</u></p>`);
  });

  it("test convertMarkdownToHTML (color)", () => {
    const md = `<span style="color: rgb(56, 161, 105);">这是红色文字!</span>`;
    const htmlString = convertMarkdownToHTML(md);
    console.log("color", htmlString);
    expect(htmlString).toBe(
      `<span style="color: rgb(56, 161, 105);">这是红色文字!</span>`,
    );
    const md2 = `这是 <span style="color: rgb(56, 161, 105);">红色文字</span> !`;
    const htmlString2 = convertMarkdownToHTML(md2);
    console.log("color", htmlString2);
    expect(htmlString2).toBe(
      `<p>这是 <span style="color: rgb(56, 161, 105);">红色文字</span> !</p>`,
    );
  });

  it("test color", () => {
    const htmlString = `<span style="color: rgb(56, 161, 105);">这是红色文字!</span>`;
    const md = convertHTMLToMarkdown(htmlString);
    console.log("color", md);
    expect(md).toBe(
      ` <span style="color: rgb(56, 161, 105);">这是红色文字!</span>`,
    );
    const htmlString2 = `这是<span style="color: rgb(56, 161, 105);">红色文字</span>!`;
    const md2 = convertHTMLToMarkdown(htmlString2);
    console.log("color", md2);
    expect(md2).toBe(`这是 <span style="color: rgb(56, 161, 105);">红色文字</span>!`);
  });
});

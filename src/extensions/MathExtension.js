import { Node, mergeAttributes } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";
import MathEditor from "../components/MathEditor.vue";
import katex from "katex";
import "katex/dist/katex.min.css";

const token = () => {
  Math.random().toString(36).substring(7) +
    Math.random().toString(36).substring(20, 27);
};

export const MathExtension = Node.create({
  name: "math",
  group: "block",
  content: "text*",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      formula: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-formula"),
        renderHTML: (attributes) => ({
          "data-formula": attributes.formula,
        }),
      },
      displayMode: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute("data-display-mode") === "true",
        renderHTML: (attributes) => ({
          "data-display-mode": attributes.displayMode,
        }),
      },
      token: {
        default: token(),
        parseHTML: (element) => element.getAttribute("data-token"),
        renderHTML: (attributes) => ({
          "data-token": attributes.token,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="math"]',
      },
      {
        tag: "span.math-inline",
      },
      {
        tag: "div.math-block",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    console.log("renderHTML", node.attrs.formula);
    const displayMode = node.attrs.displayMode === true;
    const tag = displayMode ? "div" : "span";
    const className = displayMode ? "math-block" : "math-inline";

    return [
      tag,
      mergeAttributes(HTMLAttributes, {
        class: className,
        "data-type": "math",
      }),
      0,
    ];
  },

  addNodeView() {
    return VueNodeViewRenderer(MathEditor, {
      props: {
        // 确保组件能访问到编辑器实例
        editor: this.editor,
        onUpdate: (node) => {},
      },
      // 节点更新逻辑
      shouldUpdate: (props) => {
        // 只有当节点类型匹配时才更新
        return props.newNode.type.name === this.name;
      },
      // 处理属性更新
      update: (props) => {
        // 返回 true 表示需要更新视图
        props.updateProps(); //必须要更新props
        return props.newNode.type.name === this.name;
      },
    });
  },

  addCommands() {
    return {
      insertMathInline:
        (formula) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              formula: formula || "",
              displayMode: false,
              token: token(),
            },
          });
        },

      insertMathBlock:
        (formula) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              formula: formula || "",
              displayMode: true,
              token: token(),
            },
          });
        },

      setMathFormula:
        (formula) =>
        ({ commands, chain, state }) => {
          if (state.selection.empty) return false;
          const node = state.selection.node;

          if (node && node.type.name === this.name) {
            return commands.updateAttributes(this.name, { formula });
          }
          return false;
        },

      toggleMathDisplayMode:
        () =>
        ({ commands, state }) => {
          if (state.selection.empty) return false;
          const node = state.selection.node;

          if (node.type.name === this.name) {
            const currentMode = node.attrs.displayMode;
            return commands.updateAttributes(this.name, {
              displayMode: !currentMode,
            });
          }
          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-m": () => this.editor.commands.insertMathInline(),
      "Mod-Shift-m": () => this.editor.commands.insertMathBlock(),
      "Mod-Alt-m": () => this.editor.commands.toggleMathDisplayMode(),
    };
  },
});

// 辅助函数：渲染KaTeX公式
export const renderKaTeX = (
  formula,
  displayMode = false,
  throwOnError = false,
) => {
  try {
    return katex.renderToString(formula, {
      displayMode: displayMode,
      throwOnError: throwOnError,
      errorColor: "#cc0000",
      macros: {
        "\\RR": "\\mathbb{R}",
        "\\NN": "\\mathbb{N}",
        "\\ZZ": "\\mathbb{Z}",
        "\\QQ": "\\mathbb{Q}",
        "\\CC": "\\mathbb{C}",
      },
      fleqn: true,
      leqno: false,
    });
  } catch (error) {
    console.error("KaTeX渲染错误:", error);
    return `<span class="katex-error" style="color: #cc0000;">公式错误: ${error.message}</span>`;
  }
};

// 验证LaTeX公式
export const validateLaTeX = (formula) => {
  try {
    katex.renderToString(formula, {
      displayMode: false,
      throwOnError: true,
      strict: false,
    });
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

const html2md = (html) => {
  return (
    html
      // 标题
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
      // 粗体
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
      // 斜体
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
      // 删除线
      .replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~")
      .replace(/<del[^>]*>(.*?)<\/del>/gi, "~~$1~~")
      // 链接
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      // 引用
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n")
      // 无序列表
      .replace(/<ul[^>]*>/gi, "")
      .replace(/<\/ul>/gi, "\n")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
      // 有序列表（需要更复杂的处理）
      .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
        const items = content.match(/<li[^>]*>(.*?)<\/li>/gis) || [];
        return (
          items
            .map((item, index) => {
              const itemContent = item.replace(/<li[^>]*>(.*?)<\/li>/i, "$1");
              return `${index + 1}. ${itemContent}\n`;
            })
            .join("") + "\n"
        );
      })
      // 水平线
      .replace(/<hr[^>]*>/gi, "---\n")
      // 换行
      .replace(/<br[^>]*>/gi, "\n")
      // 段落
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      // 图片
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, "![$2]($1)")
      // 清理剩余的 HTML 标签
      .replace(/<[^>]*>/g, "")
      // HTML 实体
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
  );
};

// 增强版的转换函数，支持更多格式
export const convertHTMLToMarkdown = async (html) => {
  if (!html) return "";

  // 保存公式和代码块，避免被后续转换影响
  const placeholders = {
    mathBlocks: [],
    codeBlocks: [],
  };

  // 1. 提取和保护数学公式
  let tempHtml = html;

  // 处理块级数学公式
  const blockMathRegex =
    /<[^>]*?data-formula="([^"]*)"[^>]*data-display-mode="true"[^>]*class="math-block"[^>]*data-type="math"[^>]*><\/.+?>/g;
  tempHtml = tempHtml.replace(blockMathRegex, (match, formula) => {
    const placeholder = `※※※MATHBLOCK※${placeholders.mathBlocks.length}※※※`;
    placeholders.mathBlocks.push(`\n$$${formula}$$\n`);
    return placeholder;
  });

  // 处理行内数学公式
  const inlineMathRegex =
    /<[^>]*?data-formula="([^"]*)"[^>]*data-display-mode="false"[^>]*class="math-inline"[^>]*data-type="math"[^>]*><\/.+?>/g;
  tempHtml = tempHtml.replace(inlineMathRegex, (match, formula) => {
    const placeholder = `※※※MATHINLINE※${placeholders.mathBlocks.length}※※※`;
    placeholders.mathBlocks.push(`$${formula}$`);
    return placeholder;
  });

  // 2. 提取和保护代码块
  const codeBlockRegex = /<pre[^>]*>(.*?)<\/pre>/gis;
  tempHtml = tempHtml.replace(codeBlockRegex, (match, code) => {
    const placeholder = `※※※CODEBLOCK※${placeholders.codeBlocks.length}※※※`;
    placeholders.codeBlocks.push(`\`\`\`\n${code}\n\`\`\``);
    return placeholder;
  });

  const inlineCodeRegex = /<code[^>]*>(.*?)<\/code>/gi;
  tempHtml = tempHtml.replace(inlineCodeRegex, (match, code) => {
    const placeholder = `※※※CODEINLINE※${placeholders.codeBlocks.length}※※※`;
    placeholders.codeBlocks.push(`\`${code}\``);
    return placeholder;
  });

  // 3. 常规 HTML 到 Markdown 转换
  let markdown = html2md(tempHtml);

  // 4. 恢复数学公式占位符
  placeholders.mathBlocks.forEach((math, index) => {
    const blockPlaceholder = `※※※MATHBLOCK※${index}※※※`;
    const inlinePlaceholder = `※※※MATHINLINE※${index}※※※`;
    markdown = markdown.replace(blockPlaceholder, math);
    markdown = markdown.replace(inlinePlaceholder, math);
  });

  // 5. 恢复代码块占位符
  placeholders.codeBlocks.forEach((code, index) => {
    const blockPlaceholder = `※※※CODEBLOCK※${index}※※※`;
    const inlinePlaceholder = `※※※CODEINLINE※${index}※※※`;
    markdown = markdown.replace(blockPlaceholder, code);
    markdown = markdown.replace(inlinePlaceholder, code);
  });

  // 6. 清理多余的空行和空格
  markdown = markdown
    .replace(/\n{3,}/g, "\n\n") // 最多两个连续空行
    .replace(/[ \t]+\n/g, "\n") // 删除行尾空格
    .replace(/^\s+|\s+$/g, "") // 删除首尾空格
    .trim();

  return markdown;
};

// 辅助函数：HTML 转义
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

// 转换 Markdown 到 HTML，支持 LaTeX 公式
export const convertMarkdownToHTML = async (markdown) => {
  if (!markdown) return "";

  let result = markdown;

  // 1. 提取和保护代码块
  const protectedBlocks = [];

  // 代码块保护
  const codeBlockRegex = /```[\s\S]*?```/g;
  result = result.replace(codeBlockRegex, (match) => {
    const id = protectedBlocks.length;
    protectedBlocks.push({
      type: "code",
      content: match,
      id,
    });
    return `※※※PROTECTEDBLOCK※${id}※※※`;
  });

  // 行内代码保护
  const inlineCodeRegex = /`[^`\n]+`/g;
  result = result.replace(inlineCodeRegex, (match) => {
    const id = protectedBlocks.length;
    protectedBlocks.push({
      type: "inline-code",
      content: match,
      id,
    });
    return `※※※PROTECTEDINLINE※${id}※※※`;
  });

  // 2. 处理数学公式

  // 块级数学公式（支持多行）
  const blockMathWithNewlinesRegex = /(?:^|\n)\$\$([^\$]*?)\$\$(?:\n|$)/g;
  result = result.replace(blockMathWithNewlinesRegex, (match, formula) => {
    const cleanedFormula = formula
      .trim()
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ");
    return `※※※MATHBLOCK※※※${escapeHtml(cleanedFormula)}※※※ENDMATH※※※`;
  });

  // 行内数学公式
  const inlineMathRegex = /\$([^$\n]+?[^\\])\$/g;
  result = result.replace(inlineMathRegex, (match, formula) => {
    const cleanedFormula = formula.trim();
    return `※※※MATHINLINE※※※${escapeHtml(cleanedFormula)}※※※ENDMATH※※※`;
  });

  // 3. 处理表格
  const tableRegex = /\|(.+)\|\n\|([\-:\| ]+)\|\n((?:\|.*\|\n?)*)/g;
  result = result.replace(tableRegex, (match, headers, alignRow, rows) => {
    const headerCells = headers
      .split("|")
      .filter((cell) => cell.trim())
      .map((cell) => `<th>${cell.trim()}</th>`)
      .join("");
    const alignments = alignRow
      .split("|")
      .filter((cell) => cell.trim())
      .map((cell) => {
        if (cell.startsWith(":") && cell.endsWith(":")) return "center";
        if (cell.startsWith(":")) return "left";
        if (cell.endsWith(":")) return "right";
        return "left";
      });

    const rowLines = rows.trim().split("\n");
    const bodyRows = rowLines
      .map((row) => {
        const cells = row.split("|").filter((cell) => cell.trim());
        return `<tr>${cells
          .map((cell, i) => {
            const align = alignments[i] || "left";
            return `<td style="text-align: ${align}">${cell.trim()}</td>`;
          })
          .join("")}</tr>`;
      })
      .join("");

    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  });

  // 4. 处理常规 Markdown 语法（按优先级从高到低）

  // 引用块
  const blockquoteRegex = /(^>.*$(\n>.*$)*)/gm;
  result = result.replace(blockquoteRegex, (match) => {
    const content = match.replace(/^> ?/gm, "").trim();
    const paragraphs = content
      .split("\n\n")
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
    return `<blockquote>${paragraphs}</blockquote>`;
  });

  // 无序列表
  result = result.replace(/(^[\-\*\+] .*$(\n[\-\*\+] .*$)*)/gm, (match) => {
    const items = match
      .split("\n")
      .map((line) => `<li>${line.replace(/^[\-\*\+] /, "").trim()}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // 有序列表
  result = result.replace(/(^\d+\. .*$(\n\d+\. .*$)*)/gm, (match) => {
    const items = match
      .split("\n")
      .map((line) => `<li>${line.replace(/^\d+\. /, "").trim()}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // 水平线
  result = result.replace(/^(\-{3,}|\*{3,}|_{3,})$/gm, "<hr>");

  // 标题
  result = result.replace(/^###### (.*$)/gm, "<h6>$1</h6>");
  result = result.replace(/^##### (.*$)/gm, "<h5>$1</h5>");
  result = result.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
  result = result.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  result = result.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  result = result.replace(/^# (.*$)/gm, "<h1>$1</h1>");

  // 链接
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 图片
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1">',
  );

  // 粗体
  result = result.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");

  // 斜体
  result = result.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");

  // 删除线
  result = result.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // 5. 恢复数学公式占位符
  // 块级公式
  result = result.replace(
    /※※※MATHBLOCK※※※([\s\S]*?)※※※ENDMATH※※※/g,
    (match, formula) => {
      return `<div data-formula="${formula}" data-display-mode="true" class="math-block" data-type="math"></div>`;
    },
  );

  // 行内公式
  result = result.replace(
    /※※※MATHINLINE※※※([\s\S]*?)※※※ENDMATH※※※/g,
    (match, formula) => {
      return `<span data-formula="${formula}" data-display-mode="false" class="math-inline" data-type="math"></span>`;
    },
  );

  // 6. 恢复被保护的内容
  protectedBlocks.forEach((block) => {
    const placeholder =
      block.type === "code"
        ? `※※※PROTECTEDBLOCK※${block.id}※※※`
        : `※※※PROTECTEDINLINE※${block.id}※※※`;

    if (block.type === "code") {
      const languageMatch = block.content.match(/```(\w+)?/);
      const language = languageMatch ? languageMatch[1] : "";
      const codeContent = block.content
        .replace(/```(\w+)?\n?([\s\S]*?)```/, "$2")
        .trim();

      result = result.replace(
        placeholder,
        `<pre><code${
          language ? ` class="language-${language}"` : ""
        }>${escapeHtml(codeContent)}</code></pre>`,
      );
    } else {
      const codeContent = block.content.replace(/`([^`]+)`/, "$1");
      result = result.replace(
        placeholder,
        `<code>${escapeHtml(codeContent)}</code>`,
      );
    }
  });

  // 7. 处理段落和换行
  const lines = result.split("\n");
  const processedLines = [];
  let inParagraph = false;
  let inBlock = false; //在块里

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 跳过空行
    if (line.trim() === "") {
      if (inParagraph) {
        processedLines.push("</p>");
        inParagraph = false;
      }
      continue;
    }

    // 检查是否是块级元素
    const isBlockElement = line.match(
      /^<(h[1-6]|div|span|pre|ul|ol|blockquote|hr|table|img|a|strong|em|del|code)/,
    );

    if (isBlockElement) {
      if (inParagraph) {
        processedLines.push("</p>");
        inParagraph = false;
      }
      processedLines.push(line);
      inBlock = !(
        line.match(new RegExp(`</${isBlockElement[1]}>`)) || line.match(/\/>/)
      );
    } else {
      if (!inParagraph && !inBlock) {
        processedLines.push("<p>");
        inParagraph = true;
      }
      processedLines.push(line);
    }
    // 如果不是最后一行且下一行不是块级元素，添加换行
    if (
      i < lines.length - 1 &&
      !lines[i + 1].match(/^<(h[1-6]|div|pre|ul|ol|blockquote|hr|table)/)
    ) {
      processedLines.push("<br>");
    }
  }

  if (inParagraph) {
    processedLines.push("</p>");
  }

  result = processedLines.join("");

  // 8. 清理多余的标签
  return result
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/(<p>)\s*(<br>\s*)*/g, "$1")
    .replace(/(\s*<br>\s*)*<\/p>/g, "</p>")
    .replace(/\n/g, "");
};

// 辅助函数：检测是否为数学公式
export const isMathFormula = (text) => {
  // 检查是否包含常见数学符号或结构
  const mathPatterns = [
    /\\(alpha|beta|gamma|delta|epsilon|theta|lambda|mu|nu|pi|rho|sigma|tau|phi|chi|psi|omega)/i,
    /\\frac\{/,
    /\\sqrt\{/,
    /\^\{/,
    /_\{/,
    /\\sum|\\int|\\prod|\\lim/,
    /\\begin\{[a-z]+\}/,
    /\$\$[\s\S]*?\$\$/,
    /\$[^$\n]+\$/,
  ];

  return mathPatterns.some((pattern) => pattern.test(text));
};

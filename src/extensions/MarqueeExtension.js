import { Mark } from "@tiptap/core";
import { TextSelection } from "prosemirror-state";

// 自定义跑马灯效果 Mark
export const Marquee = Mark.create({
  name: "marquee",

  addAttributes() {
    return {
      direction: {
        default: "left", //left, right, up, down
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "marquee",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["marquee", HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setMarquee:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      unsetMarquee:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      toggleMarquee:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      //选中当前鼠标所在的 Marquee 整体范围
      selectMarquee:
        () =>
        ({ state, dispatch }) => {
          const { selection, doc } = state;
          const { $from, $to } = selection;

          // 获取 Marquee 的 mark 类型
          const markType = state.schema.marks.marquee;
          if (!markType) return false;

          // 寻找当前选区是否被 marquee 标记覆盖
          let marqueeRange = null;
          doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
            if (
              node.marks &&
              node.marks.some((mark) => mark.type === markType)
            ) {
              // 找到标记，记录完整范围
              const start = pos;
              const end = pos + node.nodeSize;
              marqueeRange = { from: start, to: end };
              return false; // 停止遍历
            }
          });

          if (!marqueeRange) {
            // 如果没有直接覆盖，尝试从光标位置向两侧扩展查找
            const marqueeMark = $from.marks().find((m) => m.type === markType);
            if (marqueeMark) {
              // 从光标位置向前后扫描到标记边界
              let start = $from.pos;
              let end = $to.pos;
              // 向前扫描
              while (start > 0) {
                const char = doc.resolve(start);
                if (!char.marks().some((m) => m.type === markType)) break;
                --start;
              }
              // 向后扫描
              while (end < doc.content.size) {
                const char = doc.resolve(end);
                if (!char.marks().some((m) => m.type === markType)) break;
                end++;
              }
              marqueeRange = { from: start, to: end - 1 };
            }
          }

          if (marqueeRange) {
            if (dispatch) {
              dispatch(
                state.tr.setSelection(
                  TextSelection.create(doc, marqueeRange.from, marqueeRange.to),
                ),
              );
            }
            return true;
          }

          return false;
        },
    };
  },
});

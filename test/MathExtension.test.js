import { MathExtension, renderKaTeX, validateLaTeX } from "../src/extensions/MathExtension.js";
import katex from "katex";

jest.mock("katex");

describe("MathExtension", () => {
  describe("Extension Configuration", () => {
    it("should have correct name", () => {
      expect(MathExtension.name).toBe("math");
    });

    it("should be a block node", () => {
      expect(MathExtension.group).toBe("block");
    });

    it("should have correct attributes", () => {
      const extension = MathExtension;
      const attributes = extension.addAttributes();

      expect(attributes).toBeDefined();
      expect(attributes.formula).toBeDefined();
      expect(attributes.displayMode).toBeDefined();
    });
  });

  describe("renderKaTeX", () => {
    beforeEach(() => {
      katex.renderToString.mockClear();
    });

    it("should render valid LaTeX formula", () => {
      katex.renderToString.mockReturnValue("<span>Rendered formula</span>");

      const result = renderKaTeX("E = mc^2", false);

      expect(katex.renderToString).toHaveBeenCalledWith(
        "E = mc^2",
        expect.objectContaining({
          displayMode: false,
          throwOnError: false,
        }),
      );
      expect(result).toBe("<span>Rendered formula</span>");
    });

    it("should handle display mode", () => {
      katex.renderToString.mockReturnValue("<span>Display formula</span>");

      renderKaTeX("\\sum_{i=1}^{n} i", true);

      expect(katex.renderToString).toHaveBeenCalledWith(
        "\\sum_{i=1}^{n} i",
        expect.objectContaining({
          displayMode: true,
        }),
      );
    });

    it("should handle errors gracefully", () => {
      const error = new Error("Invalid LaTeX");
      katex.renderToString.mockImplementation(() => {
        throw error;
      });

      const result = renderKaTeX("\\invalid", false);

      expect(result).toContain("katex-error");
      expect(result).toContain("公式错误");
    });
  });

  describe("validateLaTeX", () => {
    beforeEach(() => {
      katex.renderToString.mockClear();
    });

    it("should validate correct formula", () => {
      katex.renderToString.mockReturnValue("<span>Valid</span>");

      const result = validateLaTeX("x + y = z");

      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should invalidate incorrect formula", () => {
      const error = new Error("ParseError: Invalid LaTeX");
      katex.renderToString.mockImplementation(() => {
        throw error;
      });

      const result = validateLaTeX("\\invalid");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("ParseError: Invalid LaTeX");
    });
  });

  describe("Commands", () => {
    let mockEditor;
    let extension;

    beforeEach(() => {
      mockEditor = {
        commands: {
          insertContent: jest.fn(),
          updateAttributes: jest.fn(),
        },
        state: {
          selection: {
            $from: {
              node: jest.fn(),
              depth: 1,
            },
          },
        },
      };

      // Create extension instance
      extension = {
        ...MathExtension,
        editor: mockEditor,
      };
    });

    it("should provide insertMathInline command", () => {
      const commands = extension.addCommands();

      expect(commands.insertMathInline).toBeDefined();
      expect(typeof commands.insertMathInline).toBe("function");
    });

    it("should provide insertMathBlock command", () => {
      const commands = extension.addCommands();

      expect(commands.insertMathBlock).toBeDefined();
      expect(typeof commands.insertMathBlock).toBe("function");
    });

    it("should provide setMathFormula command", () => {
      const commands = extension.addCommands();

      expect(commands.setMathFormula).toBeDefined();
      expect(typeof commands.setMathFormula).toBe("function");
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should have math insertion shortcuts", () => {
      const shortcuts = MathExtension.addKeyboardShortcuts();

      expect(shortcuts["Mod-m"]).toBeDefined();
      expect(shortcuts["Mod-Shift-m"]).toBeDefined();
      expect(shortcuts["Mod-Alt-m"]).toBeDefined();
    });
  });
});

import "@testing-library/jest-dom";

// Mock Tiptap editor for testing
global.mockEditor = {
  chain: () => global.mockEditor,
  focus: () => global.mockEditor,
  run: () => global.mockEditor,
  insertContent: () => global.mockEditor,
  insertMathInline: () => global.mockEditor,
  insertMathBlock: () => global.mockEditor,
  toggleTodo: () => global.mockEditor,
  convertToTodo: () => global.mockEditor,
  isActive: () => false,
  getHTML: () => "<p>Test content</p>",
  commands: {
    setContent: jest.fn(),
    focus: jest.fn(),
    insertMathInline: jest.fn(),
    insertMathBlock: jest.fn(),
  },
};

// Mock window.logseq
global.window = global.window || {};
global.window.logseq = {
  Editor: {
    getCurrentPage: jest.fn().mockResolvedValue({ name: "Test Page" }),
    appendBlockInPage: jest.fn().mockResolvedValue({ uuid: "test-uuid" }),
    getCurrentPageBlocksTree: jest.fn().mockResolvedValue([]),
    getBlock: jest.fn().mockResolvedValue({ content: "Test block" }),
  },
};

// Mock Katex
global.katex = {
  renderToString: jest
    .fn()
    .mockReturnValue('<span class="katex">Test formula</span>'),
};

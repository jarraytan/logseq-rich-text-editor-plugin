module.exports = {
  preset: "@vue/vue3-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "json", "vue", "ts"],
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest",
    "^.+\\.ts$": "ts-jest",
    "^.+\\.js$": "babel-jest",
    "^.+\\.css$": "jest-transform-stub",
    ".+\\.(svg|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^~/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: [
    "<rootDir>/test/*.test.[jt]s?(x)",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,ts,vue}",
    "!src/main.js",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/*.stories.js",
    "!src/**/*.stories.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "lcov", "text-summary"],
  collectCoverage: false,
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};

export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { rootMode: "upward" }]
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testTimeout: 15000,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "lcov", "text", "clover"],
  "testPathIgnorePatterns": ["/node_modules/", "tests/setup.test.js"],
};
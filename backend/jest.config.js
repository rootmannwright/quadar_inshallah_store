export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { rootMode: "upward" }]
  },
  testTimeout: 15000,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "lcov", "text", "clover"],
  extensionsToTreatAsEsm: [".js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
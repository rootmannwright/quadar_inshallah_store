export default {
  testEnvironment: "node",
  transform: {},
  testTimeout: 15000,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "lcov", "text", "clover"],
};
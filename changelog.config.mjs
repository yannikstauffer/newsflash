import conventionalcommits from "conventional-changelog-conventionalcommits"

export default await conventionalcommits({
  types: [
    { type: "feat", section: "Features" },
    { type: "fix", section: "Bug Fixes" },
    { type: "perf", section: "Performance Improvements" },
    { type: "refactor", section: "Code Refactoring" },
    { type: "docs", section: "Documentation", hidden: true },
    { type: "test", section: "Tests", hidden: true },
    { type: "chore", section: "Miscellaneous", hidden: true },
  ],
})

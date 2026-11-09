export const buildIssueApprovalPrompt = (ids: readonly string[]): string =>
  `/manage-issues issue ${ids.join('、')} を承認した`

export const buildIssueApprovalPrompt = (ids: readonly string[]): string =>
  `/manage-issues issue ${ids.join('、')} を未着手に更新してください`

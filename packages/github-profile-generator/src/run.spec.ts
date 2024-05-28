import { describe, test, expect } from "bun:test";
import { generateMarkdown } from "./run";

describe("generateMarkdown", () => {
  test("should generate correct markdown string", () => {
    const title = "サンプルタイトル";

    const expectedMarkdown = `# サンプルタイトル`;

    const result = generateMarkdown(title);
    expect(result).toBe(expectedMarkdown);
  });
});

import { writeFileSync } from "fs";
import markdownit from "markdown-it";
import { runCommand as _runCommand, runMain as _runMain } from "citty";

const md = markdownit({
  html: false,
  linkify: true,
});

const generateMarkdown = (
  title: string,
  items: string[],
  boldText: string,
): string => {
  return `
  # ${title}

  これはMarkdownのサンプルです。

  ${items.map((item) => `- ${item}`).join("\n")}

  **${boldText}**
  `;
};

const items = ["項目1", "項目2", "項目3"];
const boldText = "太字のテキスト";

const main = defineCommand({
  meta: {
    name: "github-profile-generator",
    version: "1.0.0",
    description: "Generate a GitHub profile README.md file",
  },
  args: {
    title: {
      type: "string",
      description: "Your name",
      required: true,
    },
    friendly: {
      type: "boolean",
      description: "Use friendly greeting",
    },
  },
  run({ args }) {
    try {
      const markdownContent = generateMarkdown(args.title, items, boldText);
      const result = md.render(markdownContent);
      writeFileSync("output.md", result);
      console.log("Generated output.md");
    } catch (error) {
      console.error("Failed to generate output.md");
      console.error(error);
    }
  },
});

export const runMain = _runMain(main);

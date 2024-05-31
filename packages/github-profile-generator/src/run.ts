import { writeFileSync } from "fs";
import markdownit from "markdown-it";
import {
  runCommand as _runCommand,
  runMain as _runMain,
  defineCommand,
} from "citty";

const md = markdownit({
  html: false,
  linkify: true,
});

export const generateMarkdown = (title: string): string => {
  return `# ${title}`;
};

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
      const markdownContent = generateMarkdown(args.title);
      const result = md.render(markdownContent);
      writeFileSync("output.md", result);
      console.log("Generated output.md");
    } catch (error) {
      console.error("Failed to generate output.md");
      console.error(error);
    }
  },
});

export const runMain = () => _runMain(main);

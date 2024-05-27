import { writeFileSync } from 'fs';
import markdownit from 'markdown-it';

const md = markdownit({
  html: false,
  linkify: true,
});

const generateMarkdown = (title: string, items: string[], boldText: string): string => {
  return `
  # ${title}

  これはMarkdownのサンプルです。

  ${items.map(item => `- ${item}`).join('\n')}

  **${boldText}**
  `;
};

const title = 'サンプルタイトル';
const items = ['項目1', '項目2', '項目3'];
const boldText = '太字のテキスト';

const markdownContent = generateMarkdown(title, items, boldText);
const result = md.render(markdownContent);

try {
  writeFileSync('output.md', result);
  console.log('Generated output.md');
} catch (error) {
  console.error('Failed to generate output.md');
  console.error(error);
}

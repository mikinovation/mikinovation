import type { StorybookConfig } from '@storybook/vue3-vite';

import { join, dirname } from "path"

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    getAbsolutePath('@storybook/addon-essentials'),
  ],
  "framework": {
    "name": getAbsolutePath('@storybook/vue3-vite'),
    "options": {}
  }
};
export default config;

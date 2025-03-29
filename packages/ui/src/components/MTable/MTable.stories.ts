import type { Meta, StoryObj } from '@storybook/vue3';

import MTable from './MTable.vue';

const meta = {
  title: 'MTable',
  component: MTable,
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof MTable>

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {},
};

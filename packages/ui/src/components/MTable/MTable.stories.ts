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
  render: () => ({
    components: { MTable },
    setup() {
const mockRepositories = [
  {
    id: '9f0577f2-69ff-4375-ad72-5ec9bf865abb',
    name: 'Vue'
  },
  {
    id: 'f4c4b0a0-3f4e-4c1e-8c0c-0c4d9f8e7b3f',
    name: 'React'
  },
  {
    id: 'f4c4b0a0-3f4e-4c1e-8c0c-0c4d9f8e7b3f',
    name: 'Angular'
  }
]
      return { mockRepositories }
    },
    template: `
      <MTable>
        <thead>
          <tr>
            <th>Repository</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="repo in mockRepositories" :key="repo.id">
          <td>
            {{ repo.id }}
          </td>
          <td>
          {{ repo.name }}
          </td>
        </tr>
      </tbody>
      </MTable>
    `
  })
};

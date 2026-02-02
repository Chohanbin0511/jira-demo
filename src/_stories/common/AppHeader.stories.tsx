import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AppHeader from '@features/common/components/AppHeader'

const meta = {
  title: '_features/common/components/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      // README.MD 작성 규칙과 비슷
      description: {
        component: `AppHeader는 애플리케이션의 상단 내비게이션 컴포넌트입니다.`,
      },
    },
  },
} satisfies Meta<typeof AppHeader>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AppLayout from '@features/common/components/AppLayout'

const meta = {
  title: '_features/common/components/AppLayout',
  component: AppLayout,
  tags: ['autodocs'],
  parameters: {
    docs: {
      // README.MD 작성 규칙과 비슷
      description: {
        component: `AppLayout 애플리케이션의 메인 레이아웃입니다.`,
      },
    },
  },
} satisfies Meta<typeof AppLayout>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {
  args: {
    children: <div>Router 영역</div>,
  },
}

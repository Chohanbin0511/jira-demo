import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AppSidebar from '@features/common/components/AppSidebar'
import { SidebarProvider } from '@/_features/common/components/ui/sidebar'

const meta = {
  title: '_features/common/components/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      // README.MD 작성 규칙과 비슷
      description: {
        component: `AppSidebar는 애플리케이션의 사이드 내비게이션 컴포넌트입니다.`,
      },
    },
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Story: any) => (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof AppSidebar>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {}

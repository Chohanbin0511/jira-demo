## Storybook을 사용하는 이유

- 컴포넌트 단위 개발
- 컴포넌트 사용 방법, 규칙 문서화
- 시각적 테스트 도구

<br />

## 어떤 컴포넌트를 Storybook으로 만들어야하는지?

- 비즈니스 로직을 포함한 컴포넌트
- 레이아웃 컴포넌트(Header, Sidebar, Modal 등)
- 재사용 컴포넌트

<br />

## 기본 구성

### main.ts

```ts
import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  stories: ['../src/_stories/**/*.stories.@(ts|tsx)'], // storybook을 적용할 파일 명시적으로 작성
  addons: ['@chromatic-com/storybook', '@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/nextjs-vite',
}

export default config
```

<br />

### preview.ts

```ts
import type { Preview } from '@storybook/nextjs-vite'
import '@app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
```

<br />

### [파일명].stories.tsx

\_stories 파일에 중앙화

```ts
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AppHeader from '@features/common/components/AppHeader'

const meta = {
  title: '_features/common/components/AppHeader', // storybook 내에 경로
  component: AppHeader,
  tags: ['autodocs'], // 자동 Docs 생성
  parameters: {
    docs: {
      description: {
        // Docs 설명
        // README.MD 작성 규칙과 비슷
        component: `AppHeader는 애플리케이션의 상단 내비게이션 컴포넌트입니다.`,
      },
    },
  },
} satisfies Meta<typeof AppHeader>
export default meta

type Story = StoryObj<typeof meta>
export const Default: Story = {} // Props 설정
```

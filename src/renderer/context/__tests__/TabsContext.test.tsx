// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'

import type * as RouteTitle from '@renderer/utils/routeTitle'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useEffect, useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { languageState, translate } = vi.hoisted(() => {
  const translations: Record<string, Record<string, string>> = {
    'en-US': {
      'agent.sidebar_title': 'Agent',
      'agent.session.group.conversation': 'Chat',
      'title.paintings': 'Paintings'
    },
    'zh-CN': {
      'agent.sidebar_title': '任务',
      'agent.session.group.conversation': '对话',
      'title.paintings': '绘画'
    }
  }

  return {
    languageState: { language: 'en-US' },
    translate: (key: string) => translations[languageState.language]?.[key] ?? key
  }
})

vi.mock('@logger', () => ({
  loggerService: {
    withContext: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  }
}))

vi.mock('@renderer/i18n', () => ({
  default: {
    t: translate
  }
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: translate,
    i18n: {
      language: languageState.language
    }
  })
}))

vi.mock('@renderer/data/hooks/useCache', () => {
  const pinnedTabs: unknown[] = []
  const setPinnedTabs = vi.fn()
  return {
    usePersistCache: () => [pinnedTabs, setPinnedTabs]
  }
})

vi.mock('@renderer/utils/routeTitle', async () => {
  const actual = await vi.importActual<typeof RouteTitle>('@renderer/utils/routeTitle')
  const titleKeys: Record<string, string> = {
    '/app/agents': 'agent.sidebar_title',
    '/app/chat': 'agent.session.group.conversation',
    '/app/paintings': 'title.paintings'
  }
  const getBasePath = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean)
    return segments[0] === 'app' && segments.length >= 2 ? '/' + segments.slice(0, 2).join('/') : pathname
  }

  return {
    ...actual,
    getDefaultRouteTitle: (url: string) => {
      const pathname = new URL(url, 'https://www.cherry-ai.com/').pathname
      const key = titleKeys[pathname] ?? titleKeys[getBasePath(pathname)]
      return key ? translate(key) : pathname
    }
  }
})

import { TabsProvider, useTabsContext } from '../TabsContext'

function LocalizedTabsProbe() {
  const { openTab, tabs } = useTabsContext()
  const paintingsTab = tabs.find((tab) => tab.id === 'paintings-tab')
  const customTab = tabs.find((tab) => tab.id === 'mini-app-tab')

  return (
    <>
      <div data-testid="paintings-tab-title">{paintingsTab?.title}</div>
      <div data-testid="custom-tab-title">{customTab?.title}</div>
      <button
        type="button"
        onClick={() =>
          openTab('/app/paintings/zhipu', {
            id: 'paintings-tab',
            forceNew: true
          })
        }>
        Open paintings tab
      </button>
      <button
        type="button"
        onClick={() =>
          openTab('/app/mini-app/weather', {
            id: 'mini-app-tab',
            title: 'Weather App',
            forceNew: true
          })
        }>
        Open custom tab
      </button>
    </>
  )
}

function TabTitleWriter() {
  const { tabs, updateTab } = useTabsContext()
  const didUpdateRef = useRef(false)

  useEffect(() => {
    if (didUpdateRef.current) return
    didUpdateRef.current = true
    updateTab('home', { title: 'Session title', icon: 'icon:spark' })
  }, [updateTab])

  return <div data-testid="home-title">{tabs.find((tab) => tab.id === 'home')?.title}</div>
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('TabsContext', () => {
  beforeEach(() => {
    languageState.language = 'en-US'
  })

  it('refreshes localized route tab titles when the app language changes without replacing custom titles', () => {
    const { rerender } = render(
      <TabsProvider>
        <LocalizedTabsProbe />
      </TabsProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open paintings tab' }))
    expect(screen.getByTestId('paintings-tab-title')).toHaveTextContent('Paintings')

    fireEvent.click(screen.getByRole('button', { name: 'Open custom tab' }))
    expect(screen.getByTestId('custom-tab-title')).toHaveTextContent('Weather App')

    languageState.language = 'zh-CN'
    rerender(
      <TabsProvider>
        <LocalizedTabsProbe />
      </TabsProvider>
    )

    expect(screen.getByTestId('paintings-tab-title')).toHaveTextContent('绘画')
    expect(screen.getByTestId('custom-tab-title')).toHaveTextContent('Weather App')
  })

  it('preserves page-owned titles for the fixed home conversation tab', async () => {
    render(
      <TabsProvider
        initialDefaultTab={{
          id: 'home',
          type: 'route',
          url: '/app/agents',
          title: '',
          lastAccessTime: Date.now(),
          isDormant: false
        }}
        includePinnedTabs={false}>
        <TabTitleWriter />
      </TabsProvider>
    )

    await waitFor(() => expect(screen.getByTestId('home-title')).toHaveTextContent('Session title'))
  })
})

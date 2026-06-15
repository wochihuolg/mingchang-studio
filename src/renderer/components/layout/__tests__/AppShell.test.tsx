// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  setRecentItems: vi.fn(),
  commandHandlers: new Map<string, () => void>(),
  showSearchPopup: vi.fn()
}))

const tabs = [{ id: 'home', type: 'route', url: '/home', title: 'Home' }]

async function renderAppShell(isMac: boolean) {
  vi.resetModules()
  vi.doMock('@renderer/config/constant', () => ({ isMac }))
  vi.doMock('@renderer/databases', () => ({}))
  vi.doMock('@renderer/hooks/useMacTransparentWindow', () => ({
    default: () => false
  }))
  vi.doMock('@renderer/hooks/useTabs', () => ({
    useTabs: () => ({
      tabs,
      activeTabId: 'home',
      setActiveTab: vi.fn(),
      closeTab: vi.fn(),
      updateTab: vi.fn(),
      reorderTabs: vi.fn(),
      pinTab: vi.fn(),
      unpinTab: vi.fn(),
      detachTab: vi.fn()
    })
  }))
  vi.doMock('@renderer/features/command', () => ({
    useCommandHandler: (command: string, handler: () => void) => {
      mocks.commandHandlers.set(command, handler)
    }
  }))
  vi.doMock('@renderer/data/hooks/useCache', () => ({
    usePersistCache: () => [[], mocks.setRecentItems]
  }))
  vi.doMock('@renderer/components/Popups/SearchPopup', () => ({
    default: {
      show: mocks.showSearchPopup
    }
  }))
  vi.doMock('@renderer/utils/routeTitle', () => ({
    getDefaultRouteTitle: (url: string) => url,
    isPageTitledRoute: () => false
  }))
  vi.doMock('@renderer/components/GlobalSearch/globalSearchGroups', () => ({
    createRecentRouteEntryFromTab: () => null,
    upsertGlobalSearchRecentEntry: (items: unknown[]) => items
  }))
  vi.doMock('@renderer/components/app/Sidebar', () => ({
    default: () => <aside data-testid="sidebar" />
  }))
  vi.doMock('@renderer/components/MiniApp/MiniAppTabsPool', () => ({
    default: () => <div data-testid="mini-app-pool" />
  }))
  vi.doMock('../AppShellTabBar', () => ({
    AppShellTabBar: () => <header data-testid="tab-bar" />
  }))
  vi.doMock('../TabRouter', () => ({
    TabRouter: () => <section data-testid="tab-router" />
  }))

  const { AppShell } = await import('../AppShell')
  render(<AppShell />)
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  mocks.commandHandlers.clear()
  vi.resetModules()
})

describe('AppShell', () => {
  it('opens global search from the shell-level shortcut', async () => {
    await renderAppShell(false)

    mocks.commandHandlers.get('app.search')?.()

    expect(mocks.showSearchPopup).toHaveBeenCalledTimes(1)
  })
})

describe('AppShell page side panel root', () => {
  it('marks the main content area as the page side panel root outside macOS', async () => {
    await renderAppShell(false)

    const root = document.querySelector('[data-page-side-panel-root="true"]')
    expect(root).toBeInTheDocument()
    expect(root).not.toContainElement(screen.getByTestId('tab-bar'))
    expect(root).not.toContainElement(screen.getByTestId('sidebar'))
  })

  it('does not mark a scoped page side panel root on macOS', async () => {
    await renderAppShell(true)

    expect(document.querySelector('[data-page-side-panel-root="true"]')).not.toBeInTheDocument()
  })
})

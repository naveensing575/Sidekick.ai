import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

interface SettingsStore extends Settings {
  setModel: (model: string) => void
  setTemperature: (temperature: number) => void
  setMaxTokens: (maxTokens: number) => void
  setTheme: (theme: 'dark' | 'light' | 'system') => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setModel: (model) => set({ model }),
      setTemperature: (temperature) => set({ temperature }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),
      setTheme: (theme) => set({ theme }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'sidekick-settings',
    }
  )
)

import { createContext, useContext, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('aira:theme', 'dark')
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('aira:notifications', true)
  const [developerMode, setDeveloperMode] = useLocalStorage('aira:developerMode', false)
  const [soundEnabled, setSoundEnabled] = useLocalStorage('aira:sound', true)
  const [autoInitiations, setAutoInitiations] = useLocalStorage('aira:autoInitiations', true)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = {
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    developerMode,
    setDeveloperMode,
    soundEnabled,
    setSoundEnabled,
    autoInitiations,
    setAutoInitiations,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider')
  return ctx
}

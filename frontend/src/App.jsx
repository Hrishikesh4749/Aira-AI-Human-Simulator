import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'
import SettingsPage from './pages/SettingsPage'
import AboutPage from './pages/AboutPage'
import DeveloperPage from './pages/DeveloperPage'
import NotFoundPage from './pages/NotFoundPage'
import { SettingsProvider } from './context/SettingsContext'
import { ChatProvider } from './context/ChatContext'

export default function App() {
  const location = useLocation()

  return (
    <SettingsProvider>
      <ChatProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--color-surface-2)',
              color: '#fff',
              border: '1px solid var(--color-border-strong)',
              fontSize: '13px',
            },
          }}
        />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route element={<AppShell />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/developer" element={<DeveloperPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </ChatProvider>
    </SettingsProvider>
  )
}

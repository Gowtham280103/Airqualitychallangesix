import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LocationProvider } from './context/LocationContext'
import { AlertProvider } from './context/AlertContext'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Lazy-loaded pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const AIAssistant = lazy(() => import('./pages/AIAssistant'))
const RoutePlanner = lazy(() => import('./pages/RoutePlanner'))
const IndoorAdvisor = lazy(() => import('./pages/IndoorAdvisor'))
const Sustainability = lazy(() => import('./pages/Sustainability'))
const Alerts = lazy(() => import('./pages/Alerts'))
const Community = lazy(() => import('./pages/Community'))
const ImpactTracker = lazy(() => import('./pages/ImpactTracker'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading page">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LocationProvider>
        <AlertProvider>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/assistant" element={<AIAssistant />} />
                <Route path="/routes" element={<RoutePlanner />} />
                <Route path="/indoor" element={<IndoorAdvisor />} />
                <Route path="/sustainability" element={<Sustainability />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/community" element={<Community />} />
                <Route path="/impact" element={<ImpactTracker />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </AlertProvider>
      </LocationProvider>
    </ThemeProvider>
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppProviders } from '@/app/providers/AppProviders'
import { registerDeploymentRecovery } from '@/app/recovery/deployment-recovery'
import { App } from '@/App'

import './index.css'

registerDeploymentRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)

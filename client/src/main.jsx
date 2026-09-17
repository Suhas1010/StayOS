import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import StayOS Design System
import './styles/index.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

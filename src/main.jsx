import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import AuthProvider from './contexts/AuthProviders.jsx'
import ThemeProvider from './contexts/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <App />
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)


import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LoginScreen from './LoginScreen.jsx'
import { isAuthenticated } from './auth.js'
import './index.css'

function AuthGate() {
  const [auth, setAuth] = useState(() => isAuthenticated())

  if (!auth) {
    return <LoginScreen onLogin={() => setAuth(true)} />
  }

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthGate />
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { freezePrototypes } from './security'

// Protection contre le Prototype Pollution — bloque les modifications
// malveillantes de Object.prototype, Array.prototype, Function.prototype
freezePrototypes();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

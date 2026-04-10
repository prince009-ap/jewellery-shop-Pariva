import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/formControls.css";
import "leaflet/dist/leaflet.css";
import LoaderProvider from "./context/LoaderProvider";
  ;

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <LoaderProvider>
    <App />
  </LoaderProvider>
  </StrictMode>,
)

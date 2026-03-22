import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import "./lib/i18n"
import App from "./App.tsx"

createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

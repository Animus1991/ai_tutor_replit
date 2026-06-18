import { registerSW } from "virtual:pwa-register";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/study-workspace.css";

if (import.meta.env.PROD) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById("root")!).render(<App />);

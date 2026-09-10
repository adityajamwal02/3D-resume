import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./scene.css";
import App from "./Portfolio.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

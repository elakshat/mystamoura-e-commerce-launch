import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Application root is missing");

createRoot(root).render(
  <HelmetProvider>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </HelmetProvider>
);

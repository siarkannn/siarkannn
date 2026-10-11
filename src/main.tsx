import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initScrollRestoration, resolveSavedRoute } from "./utils/scrollRestoration";

// Synchronously restore saved route if refreshing or reloaded from a subroute
const savedRoute = resolveSavedRoute();
if (savedRoute) {
  try {
    window.history.replaceState(null, "", savedRoute);
  } catch (e) {}
}

initScrollRestoration();

createRoot(document.getElementById("root")!).render(<App />);

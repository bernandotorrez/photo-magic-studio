import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import Vercel Analytics
import { inject } from '@vercel/analytics';

// Inject Vercel Analytics
inject();

// Import Vercel Speed Insights
import { injectSpeedInsights } from '@vercel/speed-insights';

// Inject Speed Insights
injectSpeedInsights();

createRoot(document.getElementById("root")!).render(<App />);

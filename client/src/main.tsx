import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

// Add Remix Icon stylesheet
const remixStyle = document.createElement('link');
remixStyle.href = "https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css";
remixStyle.rel = "stylesheet";
document.head.appendChild(remixStyle);

// Add Space Mono font
const fontStyle = document.createElement('link');
fontStyle.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap";
fontStyle.rel = "stylesheet";
document.head.appendChild(fontStyle);

// Set page title
document.title = "Solana AI Agent Dashboard";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

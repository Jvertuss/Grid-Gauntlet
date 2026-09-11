import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
    </StrictMode>
);

/*
 * Browser-app support.
 * Register only in production so Vite development always serves fresh files.
 */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        const serviceWorkerUrl = `${import.meta.env.BASE_URL}sw.js`;

        navigator.serviceWorker
            .register(serviceWorkerUrl, {
                scope: import.meta.env.BASE_URL,
            })
            .catch((error) => {
                console.warn(
                    "Gridiron Gauntlet service worker registration failed:",
                    error
                );
            });
    });
}

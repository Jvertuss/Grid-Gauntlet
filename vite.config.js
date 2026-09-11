import { defineConfig } from "vite";
import plugin from "@vitejs/plugin-react";

export default defineConfig({
    // Relative asset paths make the production build portable to
    // GitHub Pages, static hosts, and subdirectory deployments.
    base: "./",

    plugins: [
        plugin(),
    ],

    build: {
        sourcemap: false,
    },

    server: {
        port: 57786,
        watch: {
            // Keep IDE metadata/caches from crashing Vite's file watcher on Windows.
            ignored: [
                "**/.vs/**",
                "**/.vscode/**",
                "**/.idea/**",
                "**/node_modules/**",
            ],
        },
    },
});

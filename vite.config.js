import { defineConfig } from "vite";
import plugin from "@vitejs/plugin-react";

export default defineConfig({
    // GitHub Pages project URL:
    // https://jvertuss.github.io/Grid-Gauntlet/
    base: "/Grid-Gauntlet/",

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
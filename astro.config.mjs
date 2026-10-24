import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://tiabhardwaj.github.io",

    vite: {
        resolve: {
            preserveSymlinks: true,
        },
    },
});

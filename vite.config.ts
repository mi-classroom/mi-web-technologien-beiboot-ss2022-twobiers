import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode}) => {
    const env = loadEnv(mode, process.cwd());
    return {
        // Need to adjust the base-url because of the GitHub pages deployment.
        // Under GitHub Pages the base url is equal to the repository name.
        base: env.VITE_BASE_URL || '/'
    }
});
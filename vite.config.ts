import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode}) => {
    const env = loadEnv(mode, process.cwd());
    return {
        base: env.VITE_BASE_URL || '/'
    }
});
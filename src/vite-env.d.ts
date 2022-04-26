/// <reference types="vite/client" />

interface ImprotMetaEnv {
    readonly VITE_BASE_URL: string | undefined;
}

interface ImportMeta {
    readonly env: ImportMeta;
}
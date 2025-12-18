/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ADMIN_ID: string
    readonly VITE_ADMIN_PASSWORD: string
    readonly VITE_YOUTUBE_API_KEY: string
    readonly VITE_YOUTUBE_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

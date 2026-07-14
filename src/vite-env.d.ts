/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NAVER_MAP_CLIENT_ID?: string;
  readonly VITE_NAVER_STATIC_MAP_CLIENT_ID?: string;
  readonly VITE_OPENWEATHER_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

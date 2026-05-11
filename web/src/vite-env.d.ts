interface ViteTypeOptions {
  // この行を追加することで ImportMetaEnv の型を厳密にし、不明なキーを許可しないように
  // できます。
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string;
  // その他の環境変数...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

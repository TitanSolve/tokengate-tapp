/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SYNAPSE_ACCESS_TOKEN: string;
  readonly VITE_SYNAPSE_URL: string;
  readonly VITE_XRPL_MAIN_NET_URL: string;
  readonly VITE_XRPL_TEST_NET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

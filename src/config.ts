interface ApiUrls {
  accesstoken: string | undefined;
  synapseUrl: string | undefined;
  synapseUserId: string | undefined;
  xrplMainnetUrl: string | undefined;
  xrplTestnetUrl: string | undefined;
  backendUrl: string | undefined;
  marketPlace?: string | undefined;
  bithompToken?: string | undefined;
}

const API_URLS: ApiUrls = {
  accesstoken: import.meta.env.VITE_SYNAPSE_ACCESS_TOKEN,
  synapseUrl: import.meta.env.VITE_SYNAPSE_URL,
  synapseUserId: import.meta.env.VITE_SYNAPSE_USER_ID,
  xrplMainnetUrl: import.meta.env.VITE_XRPL_MAIN_NET_URL,
  xrplTestnetUrl: import.meta.env.VITE_XRPL_TEST_NET_URL,
  backendUrl: import.meta.env.VITE_BACKEND_URL,
  marketPlace: import.meta.env.VITE_MARKET_PLACE,
  bithompToken: import.meta.env.VITE_BITHOMP_TOKEN
};

export default API_URLS;

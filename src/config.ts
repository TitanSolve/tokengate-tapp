interface ApiUrls {
  accesstoken: string | undefined;
  synapseUrl: string | undefined;
  xrplMainnetUrl: string | undefined;
  xrplTestnetUrl: string | undefined;
}

const API_URLS: ApiUrls = {
  accesstoken: import.meta.env.VITE_SYNAPSE_ACCESS_TOKEN,
  synapseUrl: import.meta.env.VITE_SYNAPSE_URL,
  xrplMainnetUrl: import.meta.env.VITE_XRPL_MAIN_NET_URL,
  xrplTestnetUrl: import.meta.env.VITE_XRPL_TEST_NET_URL,
};

export default API_URLS;

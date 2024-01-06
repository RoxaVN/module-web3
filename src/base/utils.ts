export const utils = {
  isZero: (address: string) => parseInt(address, 16) === 0,
  shortenAddress: (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-6)}`,
  customChain: (chainId: string | number, providerUrl: string) => ({
    id: Number(chainId),
    name: 'Custom',
    network: 'custom',
    nativeCurrency: { decimals: 18, name: 'Custom', symbol: 'CUS' },
    rpcUrls: {
      default: { http: [providerUrl] },
      public: { http: [providerUrl] },
    },
  }),
};

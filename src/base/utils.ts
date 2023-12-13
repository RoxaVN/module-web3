export const utils = {
  isZero: (address: string) => parseInt(address, 16) === 0,
  shortenAddress: (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-6)}`,
};

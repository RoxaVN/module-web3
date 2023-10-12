import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

import { useMemo } from 'react';
import { WagmiConfig, type Chain } from 'wagmi';

export interface Web3ProviderProps {
  children: React.ReactElement;
  projectId: string;
  chains: Chain[];
}

export function Web3Provider({
  children,
  projectId,
  chains,
}: Web3ProviderProps) {
  const wagmiConfig = useMemo(() => {
    const result = defaultWagmiConfig({ chains, projectId });
    createWeb3Modal({ wagmiConfig: result, projectId, chains });
    return result;
  }, [projectId, chains]);

  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}

// declare module '@roxavn/core/web' {
//   interface AppProviderConfigs {
//     web3Provider: {
//       options: Omit<Web3ProviderProps, 'children'>;
//       component: typeof Web3Provider;
//     };
//   }
// }

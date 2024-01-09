import { Select, SelectProps } from '@mantine/core';
import { ApiInput } from '@roxavn/core/web';

import { web3AccountApi } from '../../base/index.js';

export const Web3AccountInput = ({ ...props }: Omit<SelectProps, 'data'>) => (
  <ApiInput
    {...props}
    api={web3AccountApi.getMany}
    convertData={(items) =>
      items.map((item) => ({
        value: item.id,
        label: item.name || item.id,
      }))
    }
    fetchOnFocus
    searchKey="nameText"
    onSearchChangeProp="onSearchChange"
    component={Select}
    withinPortal
    searchable
  />
);

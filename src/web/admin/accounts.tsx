import { Textarea } from '@mantine/core';
import {
  ApiFormGroup,
  ApiTable,
  IfCanAccessApi,
  ModuleT,
  PageItem,
  webModule as coreWebModule,
  utils,
} from '@roxavn/core/web';
import { IconKey, IconPlus } from '@tabler/icons-react';
import { privateKeyToAccount } from 'viem/accounts';

import { web3AccountApi } from '../../base/index.js';
import { webModule } from '../module.js';

const Page = () => {
  const { t } = webModule.useTranslation();
  const tCore = coreWebModule.useTranslation().t;
  return (
    <ApiTable
      api={web3AccountApi.getMany}
      header={t('accounts')}
      columns={{
        id: { label: tCore('id') },
        privateKey: {
          label: t('address'),
          render: (value) => {
            const account = privateKeyToAccount(value as any);
            return account.address;
          },
        },
        createdDate: {
          label: tCore('createdDate'),
          render: utils.Render.relativeTime,
        },
      }}
      headerActions={[
        {
          label: tCore('add'),
          icon: IconPlus,
          modal: {
            title: t('addWeb3Account'),
            children: (
              <ApiFormGroup
                api={web3AccountApi.create}
                fields={[
                  {
                    name: 'privateKey',
                    input: <Textarea label={t('privateKey')} />,
                  },
                ]}
              />
            ),
          },
        },
      ]}
    />
  );
};

export const accountsPage = new PageItem({
  label: <ModuleT module={webModule} k="accounts" />,
  path: 'accounts',
  icon: IconKey,
  element: (
    <IfCanAccessApi api={web3AccountApi.getMany}>
      <Page />
    </IfCanAccessApi>
  ),
});

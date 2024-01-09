import { NumberInput, TextInput } from '@mantine/core';
import {
  ApiFormGroup,
  ApiTable,
  IfCanAccessApi,
  ModuleT,
  ObjectInput,
  PageItem,
  webModule as coreWebModule,
  utils,
} from '@roxavn/core/web';
import { IconEdit, IconFileCode, IconPlus } from '@tabler/icons-react';

import { web3ContractApi } from '../../base/index.js';
import { webModule } from '../module.js';
import { Web3AccountInput } from '../components/Web3AccountInput.js';

const Page = () => {
  const { t } = webModule.useTranslation();
  const tCore = coreWebModule.useTranslation().t;
  return (
    <ApiTable
      api={web3ContractApi.getMany}
      header={t('contracts')}
      columns={{
        id: { label: tCore('id') },
        name: { label: tCore('name') },
        address: { label: t('address') },
        networkId: { label: t('networkId') },
        writeAccountId: { label: t('writeAccount') },
        updatedDate: {
          label: tCore('updatedDate'),
          render: utils.Render.relativeTime,
        },
      }}
      filters={[
        {
          name: 'networkId',
          input: <NumberInput label={t('networkId')} />,
        },
        {
          name: 'address',
          input: <TextInput label={t('address')} />,
        },
      ]}
      headerActions={[
        {
          label: tCore('add'),
          icon: IconPlus,
          modal: {
            title: t('addContract'),
            children: (
              <ApiFormGroup
                api={web3ContractApi.create}
                fields={[
                  {
                    name: 'name',
                    input: <TextInput label={tCore('name')} />,
                  },
                  {
                    name: 'networkId',
                    input: <NumberInput label={t('networkId')} />,
                  },
                  {
                    name: 'address',
                    input: <TextInput label={t('address')} />,
                  },
                  {
                    name: 'writeAccountId',
                    input: <Web3AccountInput label={t('writeAccount')} />,
                  },
                  {
                    name: 'abi',
                    input: <ObjectInput label={t('contractAbi')} />,
                  },
                ]}
              />
            ),
          },
        },
      ]}
      cellActions={(item) => [
        {
          label: tCore('edit'),
          icon: IconEdit,
          modal: {
            title: t('editContract'),
            children: (
              <ApiFormGroup
                api={web3ContractApi.update}
                apiParams={{
                  web3ContractId: item.id,
                  abi: item.abi,
                  address: item.address,
                  networkId: parseInt(item.networkId),
                  writeAccountId: item.writeAccountId,
                  name: item.name,
                }}
                fields={[
                  {
                    name: 'name',
                    input: <TextInput label={tCore('name')} />,
                  },
                  {
                    name: 'networkId',
                    input: <NumberInput label={t('networkId')} />,
                  },
                  {
                    name: 'address',
                    input: <TextInput label={t('address')} />,
                  },
                  {
                    name: 'writeAccountId',
                    input: <Web3AccountInput label={t('writeAccount')} />,
                  },
                  {
                    name: 'abi',
                    input: <ObjectInput label={t('contractAbi')} />,
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

export const contractsPage = new PageItem({
  label: <ModuleT module={webModule} k="contracts" />,
  path: 'contracts',
  icon: IconFileCode,
  element: (
    <IfCanAccessApi api={web3ContractApi.getMany}>
      <Page />
    </IfCanAccessApi>
  ),
});

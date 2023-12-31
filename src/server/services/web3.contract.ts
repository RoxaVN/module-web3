import { InferApiRequest, NotFoundException } from '@roxavn/core/base';
import { InjectDatabaseService } from '@roxavn/core/server';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import {
  NotFoundProviderException,
  utils,
  web3ContractApi,
} from '../../base/index.js';
import { Web3Contract, Web3Provider } from '../entities/index.js';
import { serverModule } from '../module.js';

@serverModule.injectable()
export class GetWeb3ContractApiService extends InjectDatabaseService {
  async handle(request: { web3contractId: string }) {
    const item = await this.entityManager.getRepository(Web3Contract).findOne({
      where: { id: request.web3contractId },
    });

    if (item) {
      return item;
    }
    throw new NotFoundException();
  }
}

@serverModule.useApi(web3ContractApi.create)
export class CreateWeb3ContractApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof web3ContractApi.create>) {
    const item = new Web3Contract();
    Object.assign(item, request);

    await this.entityManager.getRepository(Web3Contract).insert(item);
    return { id: item.id };
  }
}

@serverModule.useApi(web3ContractApi.update)
export class UpdateWeb3ContractApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof web3ContractApi.update>) {
    await this.entityManager.getRepository(Web3Contract).update(
      { id: request.web3ContractId },
      {
        address: request.address,
        abi: request.abi,
        name: request.name,
        networkId: request.networkId?.toString(),
        writeAccountId: request.writeAccountId,
      }
    );
    return {};
  }
}

@serverModule.useApi(web3ContractApi.getMany)
export class GetWeb3ContractsApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof web3ContractApi.getMany>) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    const [items, totalItems] = await this.entityManager
      .getRepository(Web3Contract)
      .findAndCount({
        where: {
          networkId: request.networkId?.toString(),
          address: request.address,
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    return {
      items: items,
      pagination: { page, pageSize, totalItems },
    };
  }
}

@serverModule.injectable()
export class WriteContractService extends InjectDatabaseService {
  async handle(request: {
    contract: {
      id?: string;
      networkId?: string | number;
      address?: `0x${string}`;
    };
    functionName: string;
    args: any[];
  }) {
    const contract = await this.entityManager
      .getRepository(Web3Contract)
      .findOne({
        relations: ['writeAccount'],
        where: {
          id: request.contract.id,
          networkId: request.contract.networkId?.toString(),
          address: request.contract.address,
        },
      });
    if (contract && contract.writeAccount) {
      const provider = await this.entityManager
        .getRepository(Web3Provider)
        .findOne({ where: { networkId: contract.networkId } });
      if (!provider) {
        throw new NotFoundProviderException(contract.networkId);
      }

      const account = privateKeyToAccount(contract.writeAccount.privateKey);
      const client = createWalletClient({
        account,
        chain: utils.customChain(contract.networkId, provider.url),
        transport: http(provider.url),
      }).extend(publicActions);

      const hash = await client.writeContract({
        address: contract.address,
        abi: contract.abi,
        functionName: request.functionName,
        args: request.args,
      });
      await client.waitForTransactionReceipt({ hash });

      return { hash };
    }
    throw new NotFoundException();
  }
}

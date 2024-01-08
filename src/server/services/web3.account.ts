import { InferApiRequest } from '@roxavn/core/base';
import { InjectDatabaseService } from '@roxavn/core/server';

import { web3AccountApi } from '../../base/index.js';
import { Web3Account } from '../entities/index.js';
import { serverModule } from '../module.js';

@serverModule.useApi(web3AccountApi.create)
export class CreateWeb3AccountApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof web3AccountApi.create>) {
    const item = new Web3Account();
    Object.assign(item, request);

    await this.entityManager.getRepository(Web3Account).insert(item);
    return { id: item.id };
  }
}

@serverModule.useApi(web3AccountApi.getMany)
export class GetWeb3AccountsApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof web3AccountApi.getMany>) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    const [items, totalItems] = await this.entityManager
      .getRepository(Web3Account)
      .findAndCount({
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    return {
      items: items,
      pagination: { page, pageSize, totalItems },
    };
  }
}

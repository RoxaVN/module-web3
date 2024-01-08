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

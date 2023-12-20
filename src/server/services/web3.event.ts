import { InferApiRequest } from '@roxavn/core/base';
import { InjectDatabaseService, databaseUtils } from '@roxavn/core/server';

import { web3EventApi } from '../../base/index.js';
import { Web3Event } from '../entities/index.js';
import { serverModule } from '../module.js';

@serverModule.useApi(web3EventApi.getMany)
export class GetWeb3EventsApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof web3EventApi.getMany>) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    let query = this.databaseService.manager.createQueryBuilder(
      Web3Event,
      'web3event'
    );
    if (request.transactionHash) {
      query = query.andWhere('web3event.transactionHash = :transactionHash', {
        transactionHash: request.transactionHash,
      });
    }
    if (request.contractAddress) {
      query = query.andWhere('web3event.contractAddress = :contractAddress', {
        contractAddress: request.contractAddress.toLowerCase(),
      });
    }
    if (request.networkId) {
      query = query.andWhere('web3event.networkId = :networkId', {
        networkId: request.networkId,
      });
    }
    if (request.event) {
      query = query.andWhere('web3event.event = :event', {
        event: request.event,
      });
    }

    if (request.eventFilters) {
      query = query.andWhere(
        databaseUtils.makeWhere(
          request.eventFilters,
          (field) => `web3event.data->>'${field}'`
        )
      );
    }

    const totalItems = await query.getCount();

    const items = await query
      .orderBy('web3event.blockNumber', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      items: items,
      pagination: { page, pageSize, totalItems },
    };
  }
}

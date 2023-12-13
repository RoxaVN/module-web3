import { InferApiRequest } from '@roxavn/core/base';
import { InjectDatabaseService } from '@roxavn/core/server';

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

    request.eventFilters?.map((filter, index) => {
      const paramName = `${filter.name}${index}`;
      let where = `web3event.data->>'${filter.name}'`;
      switch (filter.operator) {
        case 'In':
          where += ` IN (:...${paramName})`;
          break;
        case 'LessThan':
          where += ` < :${paramName}`;
          break;
        case 'LessThanOrEqual':
          where += ` <= :${paramName}`;
          break;
        case 'MoreThan':
          where += ` > :${paramName}`;
          break;
        case 'MoreThanOrEqual':
          where += ` >= :${paramName}`;
          break;
        default:
          where += ` = :${paramName}`;
      }

      query = query.andWhere(where, {
        [paramName]: filter.value,
      });
    });

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

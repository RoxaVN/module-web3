import { InferApiRequest } from '@roxavn/core/base';
import {
  BaseService,
  DatabaseService,
  InjectDatabaseService,
  serviceContainer,
} from '@roxavn/core/server';
import { MoreThan } from 'typeorm';

import { web3EventConsumerApi } from '../../base/index.js';
import { Web3Event, Web3EventConsumer } from '../entities/index.js';
import { serverModule } from '../module.js';

@serverModule.useApi(web3EventConsumerApi.getMany)
export class GetWeb3EventConsumersApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof web3EventConsumerApi.getMany>) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    const [items, totalItems] = await this.entityManager
      .getRepository(Web3EventConsumer)
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

@serverModule.injectable()
export abstract class Web3EventConsumersService extends BaseService {
  abstract consume(event: Record<string, any>): Promise<void>;
  abstract crawlerId: string;

  maxEventsPerConsume = 100;

  async handle() {
    const databaseService = await serviceContainer.getAsync(DatabaseService);

    let consumer = await databaseService.manager
      .getRepository(Web3EventConsumer)
      .findOne({
        lock: { mode: 'pessimistic_write' },
        where: {
          crawlerId: this.crawlerId,
          name: this.constructor.name,
        },
      });
    const fromBlock = consumer ? consumer.lastConsumeBlockNumber : '0';
    const events = await databaseService.manager.getRepository(Web3Event).find({
      where: {
        blockNumber: MoreThan(fromBlock),
        crawlerId: this.crawlerId,
      },
      take: this.maxEventsPerConsume,
      order: { blockNumber: 'ASC' },
    });
    if (events.length) {
      for (const event of events) {
        await this.consume(event.data);
      }
      // update consumer
      const lastConsumeBlockNumber = events[events.length - 1].blockNumber;
      if (consumer) {
        consumer.lastConsumeBlockNumber = lastConsumeBlockNumber;
        await databaseService.manager.save(consumer);
      } else {
        consumer = new Web3EventConsumer();
        consumer.crawlerId = this.crawlerId;
        consumer.name = this.constructor.name;
        consumer.lastConsumeBlockNumber = lastConsumeBlockNumber;
        await databaseService.manager
          .getRepository(Web3EventConsumer)
          .insert(consumer);
      }
    }
  }
}

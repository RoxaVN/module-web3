import { InferApiRequest, NotFoundException } from '@roxavn/core/base';
import {
  BaseService,
  DatabaseService,
  InjectDatabaseService,
  serviceContainer,
} from '@roxavn/core/server';
import { MoreThan } from 'typeorm';
import { PublicClient, createPublicClient, http } from 'viem';

import { web3EventConsumerApi } from '../../base/index.js';
import {
  Web3Event,
  Web3EventConsumer,
  Web3EventCrawler,
  Web3Provider,
} from '../entities/index.js';
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
export abstract class ConsumeWeb3EventService extends BaseService {
  abstract consume(event: Record<string, any>): Promise<void>;
  abstract crawlerId: string;

  maxEventsPerConsume = 100;

  private _publicClient: any;
  private _crawler?: any;

  private async init() {
    const databaseService = await serviceContainer.getAsync(DatabaseService);
    const crawler = await databaseService.manager
      .getRepository(Web3EventCrawler)
      .findOne({
        relations: { contract: true },
        where: { id: this.crawlerId },
      });
    if (!crawler) {
      throw new NotFoundException();
    }
    const provider = await databaseService.manager
      .getRepository(Web3Provider)
      .findOne({ where: { networkId: crawler.contract.networkId } });
    if (!provider) {
      throw new NotFoundException();
    }

    this._publicClient = createPublicClient({
      transport: http(provider.url),
    });

    this._crawler = crawler;
  }

  async getContractConfig(): Promise<{ abi: any; address: '0x${string}' }> {
    if (!this._crawler) {
      await this.init();
    }
    return {
      abi: this._crawler.contract.abi,
      address: this._crawler.contract.address,
    };
  }

  async getPublicClient(): Promise<PublicClient> {
    if (!this._publicClient) {
      await this.init();
    }
    return this._publicClient;
  }

  async getCrawler(): Promise<Web3EventCrawler> {
    if (!this._crawler) {
      await this.init();
    }
    return this._crawler;
  }

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
    const fromEvent = consumer ? consumer.lastConsumeEventId : '0';
    const events = await databaseService.manager.getRepository(Web3Event).find({
      where: {
        id: MoreThan(fromEvent),
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
      const lastConsumeEventId = events[events.length - 1].id;
      if (consumer) {
        consumer.lastConsumeEventId = lastConsumeEventId;
        await databaseService.manager
          .getRepository(Web3EventConsumer)
          .save(consumer);
      } else {
        consumer = new Web3EventConsumer();
        consumer.crawlerId = this.crawlerId;
        consumer.name = this.constructor.name;
        consumer.lastConsumeEventId = lastConsumeEventId;
        await databaseService.manager
          .getRepository(Web3EventConsumer)
          .insert(consumer);
      }
    }
  }
}

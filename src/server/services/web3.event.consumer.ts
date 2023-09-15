import { InferApiRequest, NotFoundException } from '@roxavn/core/base';
import {
  BaseService,
  DatabaseService,
  InjectDatabaseService,
  runInTransaction,
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
      let lastConsumeBlockNumber: string | undefined;
      let error: any;
      for (const event of events) {
        try {
          await runInTransaction(() => this.consume(event.data));
          lastConsumeBlockNumber = event.blockNumber;
        } catch (e) {
          error = e;
          break;
        }
      }
      // update consumer
      if (lastConsumeBlockNumber) {
        await runInTransaction(async () => {
          if (consumer) {
            consumer.lastConsumeBlockNumber = lastConsumeBlockNumber as string;
            await databaseService.manager.save(consumer);
          } else {
            consumer = new Web3EventConsumer();
            consumer.crawlerId = this.crawlerId;
            consumer.name = this.constructor.name;
            consumer.lastConsumeBlockNumber = lastConsumeBlockNumber as string;
            await databaseService.manager
              .getRepository(Web3EventConsumer)
              .insert(consumer);
          }
        });
      }
      if (error) {
        throw error;
      }
    }
  }
}

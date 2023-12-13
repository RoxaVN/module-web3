import { BaseService, DatabaseService, inject } from '@roxavn/core/server';
import { PublicClient, Log, createPublicClient, http } from 'viem';

import {
  Web3Contract,
  Web3Event,
  Web3EventCrawler,
  Web3Provider,
} from '../entities/index.js';
import { serverModule } from '../module.js';
import { GetWeb3ContractApiService } from './web3.contract.js';
import { NotFoundProviderException } from '../../base/index.js';

type ProviderItem = {
  service: PublicClient;
  entity: Web3Provider;
  lastBlockNumber: bigint;
};

@serverModule.useIntervalJob(45000)
export class Web3EventCrawlersCronService extends BaseService {
  contracts: Record<string, { entity: Web3Contract }> = {};
  providers: Record<string, ProviderItem> = {};

  constructor(
    @inject(DatabaseService)
    protected databaseService: DatabaseService,
    @inject(GetWeb3ContractApiService)
    protected getWeb3ContractApiService: GetWeb3ContractApiService
  ) {
    super();
  }

  async handle() {
    const crawlers = await this.databaseService.manager
      .getRepository(Web3EventCrawler)
      .find({
        where: { isActive: true },
      });

    const eventLogs: {
      log: Log;
      network: string;
      crawler: string;
    }[] = [];

    for (const crawler of crawlers) {
      let contract = this.contracts[crawler.contractId];
      let provider: ProviderItem;
      if (!contract) {
        const contractEntity = await this.getWeb3ContractApiService.handle({
          web3contractId: crawler.contractId,
        });
        provider = this.providers[contractEntity.networkId];
        if (!provider) {
          const providerEntity = await this.databaseService.manager
            .getRepository(Web3Provider)
            .findOne({
              where: { networkId: contractEntity.networkId },
            });
          if (!providerEntity) {
            throw new NotFoundProviderException(contractEntity.networkId);
          }
          const web3 = createPublicClient({
            transport: http(providerEntity.url),
          });
          const lastBlockNumber = await web3.getBlockNumber();
          provider = {
            service: web3,
            entity: providerEntity,
            lastBlockNumber:
              lastBlockNumber - BigInt(providerEntity.delayBlockCount),
          };
          this.providers[contractEntity.networkId] = provider;
        }
        contract = {
          entity: contractEntity,
        };
        this.contracts[crawler.contractId] = contract;
      } else {
        provider = this.providers[contract.entity.networkId];
      }

      const fromBlock = BigInt(crawler.lastCrawlBlockNumber) + BigInt(1);
      let toBlock = fromBlock + BigInt(provider.entity.blockRangePerCrawl - 1);
      if (toBlock > provider.lastBlockNumber) {
        const lastBlockNumber = await provider.service.getBlockNumber();
        provider.lastBlockNumber =
          lastBlockNumber - BigInt(provider.entity.delayBlockCount);
        toBlock = provider.lastBlockNumber;
      }
      const events = await provider.service.getLogs<any, any, any, any, any>({
        address: contract.entity.address,
        event: contract.entity.abi.find(
          (item: any) => item.type === 'event' && item.name === crawler.event
        ),
        fromBlock: fromBlock,
        toBlock: toBlock,
      });

      eventLogs.push(
        ...events.map((e) => ({
          log: e,
          network: contract.entity.networkId,
          crawler: crawler.id,
        }))
      );

      // update lastCrawlBlockNumber
      crawler.lastCrawlBlockNumber = toBlock.toString();
    }

    const items = await Promise.all(
      eventLogs.map(async ({ log, network, crawler }) => {
        const data: any = { ...(log as any).args };
        for (const key in data) {
          const value = data[key];
          data[key] = typeof value === 'bigint' ? value.toString() : value;
        }

        const result: Partial<Web3Event> = {
          transactionHash: log.transactionHash || undefined,
          blockHash: log.blockHash as string,
          blockNumber: log.blockNumber?.toString() as string,
          contractAddress: log.address,
          event: (log as any).eventName,
          transactionIndex: log.transactionIndex?.toString(),
          logIndex: log.logIndex?.toString(),
          data: data,
          networkId: network,
          crawlerId: crawler,
        };

        if (log.blockNumber) {
          const block = await this.providers[network].service.getBlock({
            blockNumber: log.blockNumber,
          });
          result.createdDate = new Date(Number(block.timestamp) * 1000);
        }

        return result;
      })
    );

    await this.databaseService.manager
      .createQueryBuilder(Web3Event, 'web3Event')
      .insert()
      .values(items)
      .orIgnore()
      .execute();

    // save crawlers
    await this.databaseService.manager
      .getRepository(Web3EventCrawler)
      .save(crawlers);

    return {};
  }
}

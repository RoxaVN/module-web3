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

@serverModule.useCronJob('* * * * *')
export class Web3EventCrawlersCronService extends BaseService {
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
    const contracts: Record<string, { entity: Web3Contract }> = {};
    type ProviderItem = {
      service: PublicClient;
      entity: Web3Provider;
      lastBlockNumber: bigint;
    };
    const providers: Record<string, ProviderItem> = {};
    const eventLogs: {
      log: Log;
      network: string;
      crawler: string;
    }[] = [];

    for (const crawler of crawlers) {
      let contract = contracts[crawler.contractId];
      let provider: ProviderItem;
      if (!contract) {
        const contractEntity = await this.getWeb3ContractApiService.handle({
          web3contractId: crawler.contractId,
        });
        provider = providers[contractEntity.networkId];
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
            chain: {
              id: parseInt(providerEntity.networkId),
              name: 'unknown',
              network: 'unknown',
              nativeCurrency: {
                decimals: 18,
                name: 'unknown',
                symbol: 'UNK',
              },
              rpcUrls: {
                default: {
                  http: [providerEntity.url],
                },
                public: {
                  http: [providerEntity.url],
                },
              },
            },
            transport: http(providerEntity.url),
          });
          const lastBlockNumber = await web3.getBlockNumber();
          provider = {
            service: web3,
            entity: providerEntity,
            lastBlockNumber:
              lastBlockNumber - BigInt(providerEntity.delayBlockCount),
          };
          providers[contractEntity.networkId] = provider;
        }
        contract = {
          entity: contractEntity,
        };
        contracts[crawler.contractId] = contract;
      } else {
        provider = providers[contract.entity.networkId];
      }

      const fromBlock = BigInt(crawler.lastCrawlBlockNumber);
      let toBlock = fromBlock + BigInt(provider.entity.blockRangePerCrawl);
      toBlock =
        toBlock > provider.lastBlockNumber ? provider.lastBlockNumber : toBlock;
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

    await this.databaseService.manager
      .createQueryBuilder()
      .insert()
      .into(Web3Event)
      .values(
        eventLogs.map(({ log, network, crawler }) => {
          const data: any = { ...(log as any).args };
          for (const key in data) {
            const value = data[key];
            data[key] = typeof value === 'bigint' ? value.toString() : value;
          }

          return {
            id: log.transactionHash || undefined,
            blockHash: log.blockHash || undefined,
            blockNumber: log.blockNumber?.toString(),
            contractAddress: log.address,
            event: (log as any).eventName,
            transactionIndex: log.transactionIndex?.toString(),
            logIndex: log.logIndex?.toString(),
            data: data,
            networkId: network,
            crawlerId: crawler,
          };
        })
      )
      .orIgnore()
      .execute();

    // save crawlers
    await this.databaseService.manager.save(crawlers);

    return {};
  }
}

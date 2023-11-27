import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { Web3EventCrawler } from './web3.event.crawler.entity.js';

@Entity()
@Unique(['blockNumber', 'logIndex', 'networkId'])
export class Web3Event {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column('text')
  event: string;

  @Column('text')
  contractAddress: string;

  @Column('bigint')
  networkId: string;

  @Index()
  @Column('bigint')
  blockNumber: string;

  @Column('bigint')
  crawlerId: string;

  @ManyToOne(() => Web3EventCrawler, (crawler) => crawler.events)
  crawler: Relation<Web3EventCrawler>;

  @Column('text')
  blockHash: string;

  @Column('bigint', { nullable: true })
  transactionIndex?: string;

  @Column('text', { nullable: true })
  transactionHash?: string;

  @Column('bigint', { nullable: true })
  logIndex?: string;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;
}

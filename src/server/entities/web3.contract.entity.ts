import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
  Unique,
  ManyToOne,
} from 'typeorm';
import { Web3EventCrawler } from './web3.event.crawler.entity.js';
import { Web3Account } from './web3.account.entity.js';

@Entity()
@Unique(['address', 'networkId'])
export class Web3Contract {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column('text')
  address: `0x${string}`;

  @Column('jsonb')
  abi: any;

  @Column('bigint')
  networkId: string;

  @Column('bigint', { nullable: true })
  writeAccountId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;

  @ManyToOne(() => Web3Account, (account) => account.contracts, {
    nullable: true,
  })
  writeAccount?: Relation<Web3Account>;

  @OneToMany(() => Web3EventCrawler, (eventCrawler) => eventCrawler.contract)
  eventCrawlers: Relation<Web3EventCrawler>[];
}

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Web3EventCrawler } from './web3.event.crawler.entity.js';

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

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;

  @OneToMany(() => Web3EventCrawler, (eventCrawler) => eventCrawler.contract)
  eventCrawlers: Relation<Web3EventCrawler>[];
}

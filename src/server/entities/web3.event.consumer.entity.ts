import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Web3EventCrawler } from './web3.event.crawler.entity.js';

@Entity()
@Unique(['name', 'crawlerId'])
export class Web3EventConsumer {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column('text')
  name: string;

  @Column('bigint')
  lastConsumeEventId: string;

  @Column('bigint')
  crawlerId: string;

  @ManyToOne(() => Web3EventCrawler, (crawler) => crawler.events)
  crawler: Relation<Web3EventCrawler>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;
}

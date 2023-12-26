import {
  ApiSource,
  ExactProps,
  IsOptional,
  Max,
  Min,
  TransformNumber,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';

export interface Web3EventConsumerResponse {
  id: string;
  name: string;
  lastConsumeEventId: string;
  crawlerId: string;
  metadata?: Record<string, any>;
  createdDate: Date;
  updatedDate: Date;
}

const web3EventConsumerSource = new ApiSource<Web3EventConsumerResponse>(
  [scopes.Web3EventConsumer],
  baseModule
);

export class GetWeb3EventConsumersRequest extends ExactProps<GetWeb3EventConsumersRequest> {
  @Min(1)
  @TransformNumber()
  @IsOptional()
  public readonly page?: number;

  @Min(1)
  @Max(100)
  @TransformNumber()
  @IsOptional()
  public readonly pageSize?: number;
}

export const web3EventConsumerApi = {
  getMany: web3EventConsumerSource.getMany({
    validator: GetWeb3EventConsumersRequest,
    permission: permissions.ReadWeb3EventConsumers,
  }),
};

import { ApiSource, PaginationRequest } from '@roxavn/core/base';

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

export class GetWeb3EventConsumersRequest extends PaginationRequest<GetWeb3EventConsumersRequest> {}

export const web3EventConsumerApi = {
  getMany: web3EventConsumerSource.getMany({
    validator: GetWeb3EventConsumersRequest,
    permission: permissions.ReadWeb3EventConsumers,
  }),
};

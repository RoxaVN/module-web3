import {
  ApiSource,
  ArrayMaxSize,
  type AttributeFilters,
  IsOptional,
  TransformJson,
  PaginationRequest,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { scopes } from '../access.js';

export interface Web3EventResponse {
  id: string;
  event: string;
  contractAddress: string;
  networkId: string;
  blockNumber: string;
  blockHash: string;
  transactionIndex?: string;
  transactionHash?: string;
  logIndex?: string;
  data: Record<string, any>;
  createdDate: Date;
}

const web3EventSource = new ApiSource<Web3EventResponse>(
  [scopes.Web3Event],
  baseModule
);

export class GetWeb3EventsRequest extends PaginationRequest<GetWeb3EventsRequest> {
  @ArrayMaxSize(10)
  @TransformJson()
  @IsOptional()
  public readonly eventFilters?: AttributeFilters;

  @IsOptional()
  public readonly transactionHash?: string;

  @IsOptional()
  public readonly contractAddress?: string;

  @IsOptional()
  public readonly event?: string;

  @IsOptional()
  public readonly networkId?: string;
}

export const web3EventApi = {
  getMany: web3EventSource.getMany({
    validator: GetWeb3EventsRequest,
  }),
};

import {
  ApiSource,
  ArrayMaxSize,
  ExactProps,
  IsOptional,
  Max,
  Min,
  TransformJson,
  TransformNumber,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { scopes } from '../access.js';

const web3EventSource = new ApiSource<{
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
}>([scopes.Web3Event], baseModule);

export interface EventFilterItem {
  name: string;
  value: any;
  operator?:
    | 'LessThan'
    | 'LessThanOrEqual'
    | 'MoreThan'
    | 'MoreThanOrEqual'
    | 'In';
}

class GetWeb3EventsRequest extends ExactProps<GetWeb3EventsRequest> {
  @ArrayMaxSize(10)
  @TransformJson()
  @IsOptional()
  public readonly eventFilters?: Array<EventFilterItem>;

  @IsOptional()
  public readonly transactionHash?: string;

  @IsOptional()
  public readonly contractAddress?: string;

  @IsOptional()
  public readonly event?: string;

  @IsOptional()
  public readonly networkId?: string;

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

export const web3EventApi = {
  getMany: web3EventSource.getMany({
    validator: GetWeb3EventsRequest,
  }),
};

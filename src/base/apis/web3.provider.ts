import {
  ApiSource,
  ExactProps,
  IsOptional,
  IsUrl,
  Min,
  MinLength,
  PaginationRequest,
  TransformNumber,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';

export interface Web3ProviderResponse {
  id: string;
  url: string;
  networkId: string;
  metadata?: Record<string, any>;
  createdDate: Date;
  delayBlockCount: number;
  blockRangePerCrawl: number;
  updatedDate: Date;
}

const web3ProviderSource = new ApiSource<Web3ProviderResponse>(
  [scopes.Web3Provider],
  baseModule
);

export class GetWeb3ProvidersRequest extends PaginationRequest<GetWeb3ProvidersRequest> {
  @IsOptional()
  networkId?: string;
}

export class UpdateWeb3ProviderRequest extends ExactProps<UpdateWeb3ProviderRequest> {
  @MinLength(1)
  public readonly web3ProviderId: string;

  @Min(1)
  public readonly networkId: number;

  @IsUrl()
  @IsOptional()
  public readonly url: string;

  @Min(1)
  @TransformNumber()
  @IsOptional()
  public readonly delayBlockCount?: number;

  @Min(1)
  @TransformNumber()
  @IsOptional()
  public readonly blockRangePerCrawl?: number;
}

export class CreateWeb3ProviderRequest extends ExactProps<CreateWeb3ProviderRequest> {
  @Min(1)
  public readonly networkId: number;

  @IsUrl()
  public readonly url: string;
}

export const web3ProviderApi = {
  create: web3ProviderSource.create({
    validator: CreateWeb3ProviderRequest,
    permission: permissions.CreateWeb3Provider,
  }),
  update: web3ProviderSource.update({
    validator: UpdateWeb3ProviderRequest,
    permission: permissions.UpdateWeb3Provider,
  }),
  getMany: web3ProviderSource.getMany({
    validator: GetWeb3ProvidersRequest,
    permission: permissions.ReadWeb3Providers,
  }),
};

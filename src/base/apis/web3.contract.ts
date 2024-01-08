import {
  ApiSource,
  ExactProps,
  IsEthereumAddress,
  IsOptional,
  MaxLength,
  Min,
  MinLength,
  PaginationRequest,
  TransformNumber,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';

export interface Web3ContractResponse {
  id: string;
  name: string;
  address: `0x${string}`;
  abi: Record<string, any>;
  networkId: string;
  writeAccountId?: string;
  metadata?: Record<string, any>;
  createdDate: Date;
  updatedDate: Date;
}

const web3ContractSource = new ApiSource<Web3ContractResponse>(
  [scopes.Web3Contract],
  baseModule
);

export class CreateWeb3ContractRequest extends ExactProps<CreateWeb3ContractRequest> {
  @IsEthereumAddress()
  public readonly address: `0x${string}`;

  @MinLength(1)
  @MaxLength(256)
  public readonly name: string;

  @Min(1)
  public readonly networkId: number;

  @MinLength(1)
  @IsOptional()
  public readonly writeAccountId?: string;

  public readonly abi: any;
}

export class UpdateWeb3ContractRequest extends ExactProps<UpdateWeb3ContractRequest> {
  @MinLength(1)
  public readonly web3ContractId: string;

  @MinLength(1)
  @MaxLength(256)
  @IsOptional()
  public readonly name?: string;

  @IsEthereumAddress()
  @IsOptional()
  public readonly address?: `0x${string}`;

  @Min(1)
  @IsOptional()
  public readonly networkId?: number;

  @MinLength(1)
  @IsOptional()
  public readonly writeAccountId?: string;

  @IsOptional()
  public readonly abi?: any;
}

export class GetWeb3ContractsRequest extends PaginationRequest<GetWeb3ContractsRequest> {
  @MinLength(1)
  @IsOptional()
  public readonly address?: `0x${string}`;

  @Min(1)
  @TransformNumber()
  @IsOptional()
  public readonly networkId?: number;
}

export const web3ContractApi = {
  getMany: web3ContractSource.getMany({
    validator: GetWeb3ContractsRequest,
    permission: permissions.ReadWeb3Contracts,
  }),
  update: web3ContractSource.update({
    validator: UpdateWeb3ContractRequest,
    permission: permissions.UpdateWeb3Contract,
  }),
  create: web3ContractSource.create({
    validator: CreateWeb3ContractRequest,
    permission: permissions.CreateWeb3Contract,
  }),
};

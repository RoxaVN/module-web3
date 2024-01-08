import {
  ApiSource,
  ExactProps,
  MaxLength,
  MinLength,
  PaginationRequest,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';
import { IsEthereumPrivateKey } from '../validation.js';

export interface Web3AccountResponse {
  id: string;
  name: string;
  privateKey: `0x${string}`;
  metadata?: Record<string, any>;
  createdDate: Date;
  updatedDate: Date;
}

const web3AccountSource = new ApiSource<Web3AccountResponse>(
  [scopes.Web3Account],
  baseModule
);

export class CreateWeb3AccountRequest extends ExactProps<CreateWeb3AccountRequest> {
  @IsEthereumPrivateKey()
  public readonly privateKey: string;

  @MinLength(1)
  @MaxLength(256)
  public readonly name: string;
}

export class GetWeb3AccountsRequest extends PaginationRequest<GetWeb3AccountsRequest> {}

export const web3AccountApi = {
  getMany: web3AccountSource.getMany({
    validator: GetWeb3AccountsRequest,
    permission: permissions.ReadWeb3Accounts,
  }),
  create: web3AccountSource.create({
    validator: CreateWeb3AccountRequest,
    permission: permissions.CreateWeb3Account,
  }),
};

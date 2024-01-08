import { ApiSource, ExactProps } from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';
import { IsEthereumPrivateKey } from '../validation.js';

export interface Web3AccountResponse {
  id: string;
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
}

export const web3AccountApi = {
  create: web3AccountSource.create({
    validator: CreateWeb3AccountRequest,
    permission: permissions.CreateWeb3Account,
  }),
};

import { Matches, ValidationOptions } from '@roxavn/core';

export const IsEthereumPrivateKey = (
  validationOptions?: ValidationOptions
): PropertyDecorator => {
  return Matches(/^0x[0-9a-fA-F]{64}$/, validationOptions);
};

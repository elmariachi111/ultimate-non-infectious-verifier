import { VerifiableCredential } from 'did-jwt-vc';

export interface ICheckCredentials {
  checkCredentials(credentials: VerifiableCredential[]): Promise<boolean>;
}

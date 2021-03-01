import { DID, JSONProof } from '.';

export interface CredentialOfferInputRequest {
  [key: string]: string | null;
}
export enum CredentialRenderTypes {
  document = 'document',
  permission = 'permission',
  claim = 'claim'
}
export interface CredentialOfferRenderInfo {
  renderAs?: CredentialRenderTypes;
  background?: {
    color?: string;
    url?: string;
  };
  logo?: {
    url: string;
  };
  text?: {
    color: string;
  };
}

export interface CredentialOfferMetadata {
  asynchronous?: boolean;
}

export interface CredentialOffer {
  type: string;
  requestedInput?: CredentialOfferInputRequest;
  renderInfo?: CredentialOfferRenderInfo;
  metadata?: CredentialOfferMetadata;
}

export interface CredentialOfferRequestAttrs {
  callbackURL: string;
  offeredCredentials: CredentialOffer[];
}

export interface CredentialOfferResponseSelection {
  type: string;
  providedInput?: {
    [key: string]: string | null;
  };
}
export interface CredentialOfferResponseAttrs {
  callbackURL: string;
  selectedCredentials: CredentialOfferResponseSelection[];
}

//customized
export interface SignedCredentialOfferResponseAttrs extends CredentialOfferResponseAttrs {
  proof: JSONProof;
  issuer: {
    id: DID;
  };
}

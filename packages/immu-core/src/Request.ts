import Web3 from 'web3';
import { DID } from './@types';

export interface PresentationRequest {
  requestedDate?: string;
  requester?: DID;
  requestedSubjects: string[];
  challenge: string;
}

export interface PresentationRequestCreationParams extends PresentationRequest {
  callbackUrl: string;
}
/**
 * //todo this is **totally** made up
 */
export function createPresentationRequest(params: PresentationRequestCreationParams): PresentationRequest {
  const presentationRequest = {
    type: ['VerifiablePresentationRequest'],
    ...params,
    challenge: params.challenge || Web3.utils.randomHex(32)

    //
    // from Jolocom:
    // query: [
    //   {
    //     type: 'ImmunizationProof',
    //     reason: "we need to know if you're immune",
    //     example: {
    //       '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/citizenship/v1'],
    //       type: 'PermanentResidentCard'
    //     }
    //   }
    // ],
  };
  return presentationRequest;
}

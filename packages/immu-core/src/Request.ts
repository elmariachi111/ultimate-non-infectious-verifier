import Web3 from 'web3';

export interface PresentationRequest {
  requestedDate: string;
  requester: DID;
  requestedSubjects: string[];
  challenge: string;
}
export function createRequest(requester: DID, subjects: string[]): PresentationRequest {
  const challenge = Web3.utils.randomHex(32);
  const presentationRequest = {
    type: ['VerifiablePresentationRequest'],
    requestedDate: new Date().toISOString(),
    requester,
    requestedSubjects: subjects,
    challenge: challenge
  };
  return presentationRequest;
}

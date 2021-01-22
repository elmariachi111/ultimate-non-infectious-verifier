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
    query: [
      {
        type: 'ImmunizationProof',
        reason: "we need to know if you're immune",
        example: {
          '@context': ['https://www.w3.org/2018/credentials/v1', 'https://w3id.org/citizenship/v1'],
          type: 'PermanentResidentCard'
        }
      }
    ],
    type: ['VerifiablePresentationRequest'],
    requestedDate: new Date().toISOString(),
    requester,
    requestedSubjects: subjects,
    challenge: challenge
  };
  return presentationRequest;
}

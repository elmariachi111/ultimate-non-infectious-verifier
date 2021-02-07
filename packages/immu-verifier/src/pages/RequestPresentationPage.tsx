import { useIdentity } from '@immu/frontend';
import { Issuer, JSONCredential, createPresentationRequest,W3CCredential, PresentationRequest, Resolver, JWTVerified, VerifiableCredential } from '@immu/core';

import { useState, useEffect } from 'react';
// import { CredentialOfferRequestAttrs, CredentialRenderTypes, SignedCredentialOfferResponseAttrs } from '@immu/core';
 import crypto from 'crypto';
 import bs58 from 'bs58';
import QRCode from 'qrcode';
import { Alert, AlertIcon, Box, Button, Code, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useClipboard } from '@chakra-ui/react';

interface PresentationResponseAttrs {
  presentationResponse: string;
}

const SMARTHEALTH_CARD_CRED_TYPE = 'https://smarthealth.cards#covid19';

type FHIRDocument = any;

const RequestPresentationPage: React.FC = () => {
  const [presentationRequestJwt, setPresentationRequestJwt] = useState<string>("");
  const [presentationJwtQrCode, setPresentationJwtQrCode] = useState<string>();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { hasCopied, onCopy } = useClipboard(presentationRequestJwt)
  const [eventSource, setEventSource] = useState<EventSource>();

  const { account, resolver, did, verifier } = useIdentity();

  function reset() {
    if (eventSource) {
      eventSource.close();
      setEventSource(undefined);
    }
    setIsValid(null);
    presentRequest(did!.id, resolver!);
  }

  const isAcceptedType = (vc: W3CCredential) => {
    return vc.type.includes(SMARTHEALTH_CARD_CRED_TYPE)
  }

  const containsValidImmunizationProof = (fhirDoc: any) => {

  }

  const getImmunizationDate = (fhirDoc: any) => {

  }

  const checkIfCredentialsAreSufficient = (credentials: VerifiableCredential[]) => {
    const credentialValidity = credentials.map( (credential: VerifiableCredential) => {
      if (typeof(credential) === "string") {
        return false;
      }
      let credentialValid = true;
      credentialValid = credentialValid && (isAcceptedType(credential))
      return credentialValid;
    })
    return credentialValidity.reduce((prv, cur) => prv && cur, true)
  }

  const presentationReceived = async (data: PresentationResponseAttrs) => {
    const verifiedPresentation = await verifier!.verifyPresentation(data.presentationResponse);
    const credentials = verifiedPresentation.verifiablePresentation.verifiableCredential;
    console.log(credentials);
    const result = checkIfCredentialsAreSufficient(credentials);
    setIsValid(result);
  }

  const presentRequest = async (did: string, resolver: Resolver) => {
    
    const interactionToken = bs58.encode(crypto.randomBytes(32));
    const request = createPresentationRequest({
      requestedSubjects: ['ProofOfImmunization', SMARTHEALTH_CARD_CRED_TYPE],
      challenge: interactionToken,
      callbackUrl: `${process.env.REACT_APP_COMM_SERVER}/${interactionToken}?flow=presentationResponse`
    });
    //console.log(request)
    const issuer = new Issuer(resolver, did);
    const presentationRequestJwt = await issuer.createAnyJwt(request, account!.privateKey);
    setPresentationRequestJwt(presentationRequestJwt);
    
    const qrCode = await QRCode.toDataURL(presentationRequestJwt);
    setPresentationJwtQrCode(qrCode);

    const _eventSource = new EventSource(`${process.env.REACT_APP_COMM_SERVER}/listen/${interactionToken}`);
    setEventSource(_eventSource);

    _eventSource.addEventListener('presentationResponse', async function (event: any) {
      const data: PresentationResponseAttrs = JSON.parse(event.data);
      await presentationReceived(data);
    });
  }
  
  useEffect(() => {
    if (did && resolver)
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [did, resolver])

  return (
   <Box>{ presentationRequestJwt &&
    <Box>
      <Heading>present your credentials</Heading>
      <Text>We're accepting <code>{SMARTHEALTH_CARD_CRED_TYPE}</code> at the moment</Text>
    <img src={presentationJwtQrCode} alt="qr code" onClick={onCopy} />
      <code >{presentationRequestJwt}</code>
    </Box>
     }
     
     
    <Modal isOpen={(isValid !== null)} onClose={reset}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Verification Result</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Alert status={isValid ? 'success' : 'error'} variant="solid">
          <AlertIcon />
          
          {isValid ? "immunization has been proven": "the credentials weren't sufficient" }
          </Alert>
        </ModalBody>

        <ModalFooter>
          <Button w="100%" my={8} onClick={reset} colorScheme="red">reset</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
     
     
     
    </Box>
  );
};

export default RequestPresentationPage;

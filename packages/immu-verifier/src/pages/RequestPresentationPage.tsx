import { useIdentity } from '@immu/frontend';
import { createPresentationRequest, Resolver, VerifiableCredential } from '@immu/core';
import { useState, useEffect } from 'react';
import crypto from 'crypto';
import bs58 from 'bs58';
import QRCode from 'qrcode';
import { Alert, AlertIcon, Box, Button, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useClipboard } from '@chakra-ui/react';

interface PresentationResponseAttrs {
  presentationResponse: string;
}

const SMARTHEALTH_CARD_CRED_TYPE = 'https://smarthealth.cards#covid19';

type FHIRResource = any;

const RequestPresentationPage: React.FC = () => {
  const [presentationRequestJwt, setPresentationRequestJwt] = useState<string>("");
  const [presentationJwtQrCode, setPresentationJwtQrCode] = useState<string>();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { onCopy } = useClipboard(presentationRequestJwt)
  const [eventSource, setEventSource] = useState<EventSource>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const { issuer, account, resolver, did, verifier } = useIdentity();

  function reset() {
    if (eventSource) {
      eventSource.close();
      setEventSource(undefined);
    }
    setIsValid(null);
    setErrorMessage("");
    presentRequest(did, resolver);
  }


  const isKnownIssuer = (did: string) => {

  }

  const checkIfCredentialsAreValid = async (credentials: VerifiableCredential[]): Promise<FHIRResource[]> => {
    const fhirResources = await Promise.all(
      credentials.map(async (credential: VerifiableCredential): Promise<FHIRResource> => {
        if (typeof (credential) === "string") {
          throw Error("we dont accept unresolved credential presentations")
        }
        if (!credential.type.includes(SMARTHEALTH_CARD_CRED_TYPE)) {
          throw Error(`atm we're only accepting ${SMARTHEALTH_CARD_CRED_TYPE} credentials`);
        }
        const { fhirResource } = credential.credentialSubject;
        if (!fhirResource) {
          throw Error("credential doesn't contain a FHIR resource")
        }

        const issuerDid = await resolver.resolve(credential.issuer.id);
        //todo: check on chain if this is a trusted issuer
        if (!(typeof (issuerDid.id) === 'string'))
          throw Error("we don't trust the issuer :( ");

        //todo: check if the credential has been revoked

        //todo: check the resource content | FHIR related
        if (fhirResource.resource.resourceType !== 'Immunization')
          return null; //skip this one.

        const { coding } = fhirResource.resource.vaccineCode
        const sidCvxCode = coding.filter((coding: any) => coding.system === 'http://hl7.org/fhir/sid/cvx');
        if (!sidCvxCode) {
          throw Error("we cannot recognize the immunization coding system")
        }

        if (!["207", "208"].includes(sidCvxCode[0].code)) {
          throw Error("we don't know the immunization type you received");
        }

        return fhirResource;
      }))
    if (fhirResources.filter(fh => fh !== null).length !== 2) {
      throw Error("sorry, we don't support bundled resources yet")
    }
    return fhirResources;
  }

  function checkIfImmunizationIsCorrect(fhirResources: FHIRResource[]) {
    const occurrenceTimes = fhirResources.map(fh => new Date(fh.resource.occurrenceDateTime));
    const msDiff = Math.abs(occurrenceTimes[0].getTime() - occurrenceTimes[1].getTime());
    const dayDiff = msDiff / 1000 / 60 / 60 / 24;
    //if (dayDiff < 28)
    //throw Error(`the immunization dates are too close (${dayDiff} days)`);

    console.log(occurrenceTimes);
    return true;
  }
  const presentationReceived = async (data: PresentationResponseAttrs) => {
    const verifiedPresentation = await verifier!.verifyPresentation(data.presentationResponse);
    const credentials = verifiedPresentation.verifiablePresentation.verifiableCredential;
    console.log(credentials);
    try {
      const fhirResources = await checkIfCredentialsAreValid(credentials);
      checkIfImmunizationIsCorrect(fhirResources);
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
      setErrorMessage(e.message);
    }
  }

  const presentRequest = async (did: string, resolver: Resolver) => {

    const interactionToken = bs58.encode(crypto.randomBytes(32));
    const request = createPresentationRequest({
      requestedSubjects: ['ProofOfImmunization', SMARTHEALTH_CARD_CRED_TYPE],
      challenge: interactionToken,
      callbackUrl: `${process.env.REACT_APP_COMM_SERVER}/${interactionToken}?flow=presentationResponse`
    });

    const presentationRequestJwt = await issuer.createAnyJwt(request, account.privateKey);
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
    <Box mt={6}>{presentationRequestJwt &&
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

              {isValid ? "immunization has been proven" : errorMessage}
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

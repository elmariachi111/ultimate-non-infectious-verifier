import { useIdentity, useCredentialVerifier } from '@immu/frontend';
import { createPresentationRequest, Resolver } from '@immu/core';
import { useState, useEffect } from 'react';
import crypto from 'crypto';
import bs58 from 'bs58';
import QRCode from 'qrcode';
import { Alert, AlertIcon, Box, Button, Code, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useClipboard } from '@chakra-ui/react';

interface PresentationResponseAttrs {
  presentationResponse: string;
}

const RequestPresentationPage: React.FC = () => {
  const [presentationRequestJwt, setPresentationRequestJwt] = useState<string>("");
  const [presentationJwtQrCode, setPresentationJwtQrCode] = useState<string>();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { onCopy } = useClipboard(presentationRequestJwt)
  const [eventSource, setEventSource] = useState<EventSource>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const { issuer, account, resolver, did, verifier } = useIdentity();

  const { credentialVerifier } = useCredentialVerifier()

  function reset() {
    if (eventSource) {
      eventSource.close();
      setEventSource(undefined);
    }
    setIsValid(null);
    setErrorMessage("");
    presentRequest(did, resolver);
  }

  const presentationReceived = async (data: PresentationResponseAttrs) => {
    const verifiedPresentation = await verifier.verifyPresentation(data.presentationResponse);
    const credentials = verifiedPresentation.payload.vp.verifiableCredential;
    console.log(credentials);
    try {
      await credentialVerifier.verify(credentials);
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
      setErrorMessage(e.message);
    }
  }

  const presentRequest = async (did: string, resolver: Resolver) => {

    const interactionToken = bs58.encode(crypto.randomBytes(32));
    const request = createPresentationRequest({
      requestedSubjects: ['ProofOfImmunization', ...credentialVerifier.supportedStrategies],
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
        <Box>
          <Text>We're accepting </Text>
          <Box>
          {credentialVerifier.supportedStrategies.map(strategy => (
            <Code key={`strategy-${strategy}`}>{strategy}</Code>
          ))}
          </Box>
          <Text>at the moment</Text>
        </Box>
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

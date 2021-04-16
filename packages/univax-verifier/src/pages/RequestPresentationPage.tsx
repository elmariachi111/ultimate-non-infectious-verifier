import { Box, Code, Flex, Heading, Image, Spinner, Text, useBoolean, useClipboard } from '@chakra-ui/react';
import { createPresentationRequest } from '@univax/core';
import { useCredentialVerifier, useIdentity } from '@univax/frontend';
import bs58 from 'bs58';
import crypto from 'crypto';
import ValidationResultBox from 'molecules/ValidationResultBox';
import ValidationResultCredentials from 'molecules/ValidationResultCredentials';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { ValidationResult } from 'types/ValidationResult';

interface PresentationResponseAttrs {
  presentationResponse: string;
}

const RequestPresentationPage: React.FC = () => {
  const [presentationRequestJwt, setPresentationRequestJwt] = useState<string>("");
  const [presentationJwtQrCode, setPresentationJwtQrCode] = useState<string>();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useBoolean(false);

  const { onCopy, hasCopied } = useClipboard(presentationRequestJwt)
  const [eventSource, setEventSource] = useState<EventSource>();
  
  const { issuer, account, resolver, did, verifier } = useIdentity();

  const { credentialVerifier } = useCredentialVerifier()

  function reset() {
    if (eventSource) {
      eventSource.close();
      setEventSource(undefined);
    }
    setValidationResult(null);
    presentRequest();
  }

  const presentationReceived = async (data: PresentationResponseAttrs) => {
    const verifiedPresentation = await verifier.verifyPresentation(data.presentationResponse);
    const credentials = verifiedPresentation.payload.vp.verifiableCredential;
    setLoading.on()
    let result: ValidationResult;
    try {
      const verifiedCredentials = await credentialVerifier.verify(credentials)
      result = {
        credentials: verifiedCredentials,
        isValid: true
      };
    } catch (e) {
      result = {
        credentials: [],
        isValid: false,
        errorMessage: e.message
      }
    }
    setValidationResult(result);
    setLoading.off()
  }

  const presentRequest = async () => {

    const interactionToken = bs58.encode(crypto.randomBytes(32));
    const request = createPresentationRequest({
      requestedSubjects: [...credentialVerifier.supportedStrategies],
      challenge: interactionToken,
      callbackUrl: `${process.env.REACT_APP_COMM_SERVER}/comm/${interactionToken}?flow=presentationResponse`
    });

    const presentationRequestJwt = await issuer.createAnyJwt(request, account.privateKey);
    setPresentationRequestJwt(presentationRequestJwt);

    const qrCode = await QRCode.toDataURL(presentationRequestJwt);
    setPresentationJwtQrCode(qrCode);

    const _eventSource = new EventSource(`${process.env.REACT_APP_COMM_SERVER}/comm/listen/${interactionToken}`);
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
    <Box mt={6}>
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
      {
      validationResult 
        ? <>
            <Box my={3}>
              <ValidationResultBox {...validationResult} reset={reset} />
            </Box>
            <ValidationResultCredentials {...validationResult} />
          </> 
        : <Flex direction="column" alignItems="center">
            {presentationJwtQrCode && (<>
            <Box position="relative">
              {loading && <Box position="absolute" left="50%" top="50%"> 
              <Spinner thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                margin="auto auto"
                size="xl" position="relative" left="-50%" top="-50%" />
                </Box> }
              <Image src={presentationJwtQrCode} alt="qr code" onClick={onCopy} opacity={loading ? 0.2 : 1} />
            </Box>
            {hasCopied && <Text color="green.400">copied to clipboard</Text>}
            </>
            )}
          </Flex>
      }    

    </Box>
  );
};

export default RequestPresentationPage;

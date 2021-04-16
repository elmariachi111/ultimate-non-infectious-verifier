import { Box, Code, Flex, Heading, Image, Text, useClipboard } from '@chakra-ui/react';
import { createPresentationRequest } from '@univax/core';
import { useCredentialVerifier, useIdentity } from '@univax/frontend';
import bs58 from 'bs58';
import crypto from 'crypto';
import ValidationResultCredentials from 'molecules/ValidationResultCredentials';
import ValidationResultModal from 'molecules/ValidationResultBox';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { ValidationResult } from 'types/ValidationResult';
import ValidationResultBox from 'molecules/ValidationResultBox';

interface PresentationResponseAttrs {
  presentationResponse: string;
}

const RequestPresentationPage: React.FC = () => {
  const [presentationRequestJwt, setPresentationRequestJwt] = useState<string>("");
  const [presentationJwtQrCode, setPresentationJwtQrCode] = useState<string>();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

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
    console.log(credentials);
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
    <Box mt={6} >{presentationRequestJwt &&
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
        <Flex direction="column" alignItems="center">
          <Image src={presentationJwtQrCode} alt="qr code" onClick={onCopy} />
          {hasCopied && <Text color="green.400">copied to clipboard</Text>}
        </Flex>
      </Box>
    }
    {
      validationResult && <>
        <Box my={3}>
          <ValidationResultBox {...validationResult} reset={reset} />
        </Box>
        <ValidationResultCredentials {...validationResult} />
      </>
    }
    </Box>
  );
};

export default RequestPresentationPage;

import { Box, Button, Flex, FormControl, FormLabel, Heading, Textarea, useToast, VStack } from '@chakra-ui/react';
import { useIdentity } from '@univax/frontend';
import React, { useEffect, useState } from 'react';
import { CredentialOfferRequestAttrs, CredentialOffer } from '@univax/core';
import CredentialOfferCard from 'molecules/CredentialOfferCard';
//import fetch from 'cross-fetch';
import { useCredentials } from 'hooks/CredentialStorage';
import QrReader from 'react-qr-reader';
import { io, Socket } from 'socket.io-client';

interface ReceivedCredential {
  interactionToken: string;
  signedCredentialJwt: string;
}

const AcceptCredentialOffer = () => {
  const { verifier, issuer, account } = useIdentity();

  const [credentialOffer, setCredentialOffer] = useState<CredentialOfferRequestAttrs & { issuer: string }>();
  const [isScanning, setScanning] = useState<boolean>(false);
  const [socket, setSocket] = useState<any>();

  useEffect(() => {
    const _socket = io(process.env.REACT_APP_COMM_SERVER as string);
    _socket.on('connect', () => {
      console.log(_socket.id);
    });
    setSocket(_socket);
  }, []);

  const { addCredential } = useCredentials();
  const toast = useToast();

  const acceptCredentialOffer = async (acceptedOffer: CredentialOffer) => {
    const issuerDid = await issuer.resolveIssuerDid();
    const payload = {
      interactionToken: acceptedOffer.interactionToken,
      subjectToken: socket!.id,
      issuer: {
        id: issuerDid.id
      },
      selectedCredentials: [{ type: acceptedOffer.type }]
    };

    const proof = await issuer.createJsonProof(payload, issuerDid.publicKey[0], account.privateKey);
    const serverPayload = {
      ...payload,
      proof
    };

    //const interactionToken = new URL(credentialOffer!.callbackURL).pathname.split('/').slice(-1)[0];
    //const eventSource = new EventSource(`${process.env.REACT_APP_COMM_SERVER}/comm/listen/${interactionToken}`);
    socket!.on('credentialIssued', async (credential: ReceivedCredential) => {
      //eventSource.addEventListener('receiveCredential', async function (event: any) {
      console.debug(credential);
      await receiveCredential(credential);
    });

    socket!.emit('credentialOfferAccepted', serverPayload);

    // const response = await fetch(payload.callbackURL, {
    //   method: 'POST',
    //   body: JSON.stringify(serverPayload),
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // });
  };

  const receiveCredential = async (data: ReceivedCredential) => {
    const jwt = data.signedCredentialJwt;
    const verifiedCredential = await verifier.verifyCredential(jwt);
    if (verifiedCredential) {
      addCredential(verifiedCredential);
    }
    setCredentialOffer(undefined);
    toast({
      title: 'Credential accepted.',
      description: 'the issuer has created a credential for you.',
      status: 'success',
      duration: 5000,
      isClosable: true
    });
  };

  const onOfferReceived = async (value: string) => {
    const verified = await verifier.verifyAnyJwt(value);
    if (verified) {
      console.log(verified);
      setCredentialOffer({
        ...verified.payload,
        issuer: verified.issuer
      });
    }
  };

  const submitted = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      credentialOffer: { value: string };
    };

    await onOfferReceived(target.credentialOffer.value);
    target.credentialOffer.value = '';
  };

  const handleScan = (data: null | string) => {
    if (data) {
      setScanning(false);
      onOfferReceived(data);
    }
  };

  return (
    <Box>
      <form onSubmit={submitted}>
        <FormControl id="credentialOffer">
          <FormLabel>Paste a credential offer</FormLabel>
          <Textarea name="credentialOffer"></Textarea>
        </FormControl>
        <Flex align="flex-end" justify="space-between">
          <Button type="submit" colorScheme="teal">
            submit
          </Button>
          <Button type="button" colorScheme="teal" onClick={() => setScanning(!isScanning)}>
            {isScanning ? 'stop' : 'scan'}
          </Button>
        </Flex>
      </form>

      {isScanning && (
        <div>
          <QrReader
            delay={300}
            onError={console.error}
            onScan={handleScan}
            showViewFinder={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      {credentialOffer && (
        <VStack mt={6}>
          <Heading size="lg">Accept these Credentials?</Heading>
          {credentialOffer.offeredCredentials.map((cred) => (
            <CredentialOfferCard
              acceptCredentialOffer={acceptCredentialOffer}
              issuer={credentialOffer.issuer}
              offer={cred}
              key={`${cred.type}`}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default AcceptCredentialOffer;

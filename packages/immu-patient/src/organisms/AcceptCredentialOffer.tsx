import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Textarea,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useIdentity } from '@immu/frontend';
import React, { useState } from 'react';
import { CredentialOfferRequestAttrs, CredentialOffer, Issuer } from '@immu/core';
import CredentialOfferCard from 'molecules/CredentialOfferCard';
import fetch from 'cross-fetch';
import { useCredentials } from 'hooks/CredentialStorage';

interface ReceivedCredential {
  signedCredentialJwt: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AcceptCredentialOffer = () => {
  const { verifier, resolver, did, account } = useIdentity();

  const [credentialOffer, setCredentialOffer] = useState<CredentialOfferRequestAttrs & { issuer: string }>();

  const { addCredential } = useCredentials();
  const toast = useToast();

  const submitted = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      credentialOffer: { value: string };
    };

    const verified = await verifier?.verifyAnyJwt(target.credentialOffer.value);
    if (verified) {
      console.log(verified);
      setCredentialOffer({
        ...verified.payload,
        issuer: verified.issuer
      });
    }

    target.credentialOffer.value = '';
  };

  const acceptCredentialOffer = async (acceptedOffer: CredentialOffer) => {
    const issuer = new Issuer(resolver!, did!.id);
    const payload = {
      callbackURL: credentialOffer!.callbackURL,
      selectedCredentials: [{ type: acceptedOffer.type }]
    };
    const proof = await issuer.createJsonProof(payload, did!.publicKey[0], account!.privateKey);
    const serverPayload = {
      ...payload,
      proof
    };

    const interactionToken = new URL(credentialOffer!.callbackURL).pathname.split('/').slice(-1)[0];
    const eventSource = new EventSource(`${process.env.REACT_APP_COMM_SERVER}/listen/${interactionToken}`);

    eventSource.addEventListener('receiveCredential', async function (event: any) {
      await receiveCredential(JSON.parse(event.data), interactionToken);
      eventSource.close();
    });

    const response = await fetch(payload.callbackURL, {
      method: 'POST',
      body: JSON.stringify(serverPayload),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log(await response.json());
    }
  };

  const receiveCredential = async (data: ReceivedCredential, interactionToken: string) => {
    const jwt = data.signedCredentialJwt;
    const verified = await verifier?.verifyCredential(jwt);
    if (verified) {
      addCredential(verified.verifiableCredential);
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

  return (
    <Box>
      <form onSubmit={submitted}>
        <FormControl id="credentialOffer">
          <FormLabel>Paste a credential offer</FormLabel>
          <Textarea name="credentialOffer"></Textarea>
        </FormControl>
        <Button type="submit" colorScheme="teal">
          submit
        </Button>
      </form>
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

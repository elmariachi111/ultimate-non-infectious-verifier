import { Box, Heading, useToast } from '@chakra-ui/react';
import {
  Covid19,
  CreateFhirHL7Immunization,
  CreateSchemaOrgImmunization,
  CredentialOfferRequestAttrs,
  CredentialRenderTypes,
  Issuer,
  SCHEMAORG_CRED_TYPE,
  SignedCredentialOfferResponseAttrs,
  SMARTHEALTH_CARD_CRED_TYPE
} from '@univax/core';
import { useIdentity } from '@univax/frontend';
import bs58 from 'bs58';
import crypto from 'crypto';
import QrModal from 'molecules/QrModal';
import ImmunizationForm from 'organisms/ImmunizationForm';
import { useState } from 'react';

const IndexPage: React.FC = () => {
  const { account, resolver, did, verifier, issuer } = useIdentity();

  const [offerJwt, setOfferJwt] = useState<string>('');
  const toast = useToast();

  const reset = async () => {
    setOfferJwt('');
  };

  const offerResponseReceived = async (
    response: SignedCredentialOfferResponseAttrs,
    credentialSubject: Record<string, any>,
    _interactionToken: string
  ) => {
    const proven = await verifier.verifyJsonCredential(response);
    if (!proven) {
      throw Error('the offer proof is invalid');
    }
    const receiverDid = await resolver.resolve(response.proof.verificationMethod);
    console.log(credentialSubject);

    const credential = await issuer.issueCredential(
      receiverDid.id,
      credentialSubject,
      response.selectedCredentials.map((selected) => selected.type)
    );

    const credentialJwt = await issuer.createJwt(credential, account.privateKey);
    console.debug(credentialJwt);

    const dispatchCredential = await fetch(
      `${process.env.REACT_APP_COMM_SERVER}/comm/${_interactionToken}?flow=receiveCredential`,
      {
        method: 'POST',
        body: JSON.stringify({ signedCredentialJwt: credentialJwt }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const dispatchResult = await dispatchCredential.json();
    reset();

    toast({
      title: 'Credential accepted.',
      description: 'the subject has accepted your credential.',
      status: 'success',
      duration: 5000,
      isClosable: true
    });
  };

  const Creators: Record<string, (params: Covid19.CovidImmunization) => any> = {
    [SMARTHEALTH_CARD_CRED_TYPE]: CreateFhirHL7Immunization,
    [SCHEMAORG_CRED_TYPE]: CreateSchemaOrgImmunization
  };

  const onImmunizationCreated = async (credentialParams: Covid19.CovidImmunization, credentialType: string) => {
    const credentialSubject = Creators[credentialType](credentialParams);
    const interactionToken = bs58.encode(crypto.randomBytes(32));
    const offerRequest: CredentialOfferRequestAttrs = {
      callbackURL: `${process.env.REACT_APP_COMM_SERVER}/comm/${interactionToken}?flow=credentialOfferResponse`,
      offeredCredentials: [
        {
          type: credentialType,
          renderInfo: {
            renderAs: CredentialRenderTypes.claim,
            background: {
              color: '#4fd1c4'
            },
            text: {
              color: '#FFFFFF'
            }
          }
        }
      ]
    };

    const issuer = new Issuer(resolver, did);
    const jwt = await issuer.createAnyJwt(offerRequest, account.privateKey);
    setOfferJwt(jwt);

    const eventSource = new EventSource(`${process.env.REACT_APP_COMM_SERVER}/comm/listen/${interactionToken}`);

    eventSource.addEventListener('credentialOfferResponse', async function (event: any) {
      const data: SignedCredentialOfferResponseAttrs = JSON.parse(event.data);
      await offerResponseReceived(data, credentialSubject, interactionToken);
      eventSource.close();
    });
  };

  return (
    <Box>
      <Heading size="xl" mt={8}>
        issue an immunization credential
      </Heading>
      <ImmunizationForm onImmunizationCreated={onImmunizationCreated} />
      {offerJwt && <QrModal onClose={reset} jwt={offerJwt} />}
    </Box>
  );
};

export default IndexPage;

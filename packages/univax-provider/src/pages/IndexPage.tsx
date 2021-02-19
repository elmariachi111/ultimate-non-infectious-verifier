import {
  Issuer,
  CreateFhirHL7Immunization,
  CreateSchemaOrgImmunization,
  CredentialOfferRequestAttrs,
  CredentialRenderTypes,
  SignedCredentialOfferResponseAttrs,
  SMARTHEALTH_CARD_CRED_TYPE,
  SCHEMAORG_CRED_TYPE,
  Covid19
} from '@univax/core';
import { useIdentity } from '@univax/frontend';
import ImmunizationForm from 'organisms/ImmunizationForm';
import { useState } from 'react';
import crypto from 'crypto';
import bs58 from 'bs58';
import { Box, Heading, useClipboard, useToast } from '@chakra-ui/react';

import QRCode from 'qrcode';

const IndexPage: React.FC = () => {
  const { account, resolver, did, verifier, issuer } = useIdentity();

  const [offerJwt, setOfferJwt] = useState<string>('');
  const [offerJwtQrCode, setOfferJwtQrCode] = useState<string>();
  const toast = useToast();
  const { onCopy } = useClipboard(offerJwt);

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

    console.log(await dispatchCredential.json());
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
              color: '#26d3b3'
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
    const qrCode = await QRCode.toDataURL(jwt);

    setOfferJwt(jwt);
    setOfferJwtQrCode(qrCode);

    const eventSource = new EventSource(`${process.env.REACT_APP_COMM_SERVER}/comm/listen/${interactionToken}`);

    eventSource.addEventListener('credentialOfferResponse', async function (event: any) {
      const data: SignedCredentialOfferResponseAttrs = JSON.parse(event.data);
      await offerResponseReceived(data, credentialSubject, interactionToken);
      eventSource.close();
    });
  };

  return (
    <>
      <Heading size="lg" mt={8}>
        issue an immunization credential
      </Heading>
      <ImmunizationForm onImmunizationCreated={onImmunizationCreated} />
      {offerJwt && (
        <Box>
          <img src={offerJwtQrCode} alt="qr code" onClick={onCopy} />
          <code>{offerJwt}</code>
        </Box>
      )}
    </>
  );
};

export default IndexPage;

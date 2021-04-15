import {
  Issuer,
  CreateFhirHL7Immunization,
  CreateSchemaOrgImmunization,
  CredentialRenderTypes,
  CredentialOfferRequestAttrs,
  SignedCredentialOfferResponseAttrs,
  SMARTHEALTH_CARD_CRED_TYPE,
  SCHEMAORG_CRED_TYPE,
  Covid19
} from '@univax/core';
import { useIdentity, useLibP2P, P2PMessage } from '@univax/frontend';
import ImmunizationForm from 'organisms/ImmunizationForm';
import { useState, useEffect } from 'react';
import { Box, Heading, useClipboard, useToast } from '@chakra-ui/react';
import QRCode from 'qrcode';
import bs58 from 'bs58';
import crypto from 'crypto';

const IndexPage: React.FC = () => {
  const { account, resolver, did, verifier, issuer } = useIdentity();
  const { p2p, peerId, rendezvousServer, messageEmitter } = useLibP2P();
  const [offerJwt, setOfferJwt] = useState<string>('');

  const [offerJwtQrCode, setOfferJwtQrCode] = useState<string>();
  const toast = useToast();
  const { onCopy } = useClipboard(offerJwt);

  const offerResponseReceived = async (
    response: SignedCredentialOfferResponseAttrs,
    credentialSubject: Record<string, any>
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

    socket!.emit('credentialIssued', {
      signedCredentialJwt: credentialJwt
    });
    //console.log(await dispatchCredential.json());
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
    const interactionToken = `${peerId!.id.toString()}.bs58.encode(crypto.randomBytes(32))`;
    const offerRequest: CredentialOfferRequestAttrs = {
      interactionToken,
      //callbackURL: `${process.env.REACT_APP_COMM_SERVER}/comm/${interactionToken}?flow=credentialOfferResponse`,
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

    //const eventSource = new EventSource(`${process.env.REACT_APP_COMM_SERVER}/comm/listen/${interactionToken}`);
    //eventSource.addEventListener('credentialOfferResponse',
    messageEmitter.on('credentialOfferAccepted', async function (_data: string) {
      const data: SignedCredentialOfferResponseAttrs = JSON.parse(_data);
      console.log(data);
      await offerResponseReceived(data, credentialSubject);
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

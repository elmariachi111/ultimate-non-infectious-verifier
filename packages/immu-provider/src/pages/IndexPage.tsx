import { Issuer, SMARTHEALTH_CARD_CRED_TYPE } from '@immu/core';
import { useIdentity } from '@immu/frontend';
import FhirImmunizationForm from 'organisms/FhirImmunizationForm';
import { useState } from 'react';
import { CredentialOfferRequestAttrs, CredentialRenderTypes, SignedCredentialOfferResponseAttrs } from '@immu/core';
import crypto from 'crypto';
import bs58 from 'bs58';
import { Box, Heading, useClipboard, useToast } from '@chakra-ui/react';

import QRCode from 'qrcode';

type FHIRDocument = Record<string, any>;

const IndexPage: React.FC = () => {
  const { account, resolver, did, verifier, issuer } = useIdentity();

  const [, setFhirDocument] = useState<FHIRDocument>();

  const [offerJwt, setOfferJwt] = useState<string>('');
  const [offerJwtQrCode, setOfferJwtQrCode] = useState<string>();
  const toast = useToast();
  const { onCopy } = useClipboard(offerJwt);

  const offerResponseReceived = async (
    response: SignedCredentialOfferResponseAttrs,
    _fhirDocument: FHIRDocument,
    _interactionToken: string
  ) => {
    const proven = await verifier.verifyJsonCredential(response);
    if (!proven) {
      throw Error('the offer proof is invalid');
    }
    const receiverDid = await resolver.resolve(response.proof.verificationMethod);

    const credential = await issuer.issueCredential(
      receiverDid.id,
      {
        fhirVersion: '4.0.1',
        fhirResource: _fhirDocument
      },
      response.selectedCredentials.map((selected) => selected.type)
    );

    const credentialJwt = await issuer.createJwt(credential, account.privateKey);
    console.log(credentialJwt);

    const dispatchCredential = await fetch(
      `${process.env.REACT_APP_COMM_SERVER}/${_interactionToken}?flow=receiveCredential`,
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
  const onFhirCreated = async (_fhirDocument: FHIRDocument) => {
    setFhirDocument(_fhirDocument);
    const interactionToken = bs58.encode(crypto.randomBytes(32));

    const offerRequest: CredentialOfferRequestAttrs = {
      callbackURL: `${process.env.REACT_APP_COMM_SERVER}/${interactionToken}?flow=credentialOfferResponse`,
      offeredCredentials: [
        {
          type: SMARTHEALTH_CARD_CRED_TYPE,
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

    const eventSource = new EventSource(`${process.env.REACT_APP_COMM_SERVER}/listen/${interactionToken}`);

    eventSource.addEventListener('credentialOfferResponse', async function (event: any) {
      const data: SignedCredentialOfferResponseAttrs = JSON.parse(event.data);
      await offerResponseReceived(data, _fhirDocument, interactionToken);
      eventSource.close();
    });
  };

  return (
    <>
      <Heading size="lg" mt={8}>
        issue an immunization credential
      </Heading>
      <FhirImmunizationForm onFhirCreated={onFhirCreated} />
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

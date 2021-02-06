import { Issuer } from '@immu/core';
import { useIdentity } from '@immu/frontend';
import FhirImmunizationForm from 'organisms/FhirImmunizationForm';
import { useState } from 'react';
import { CredentialOfferRequestAttrs, CredentialRenderTypes, SignedCredentialOfferResponseAttrs } from 'types/Jolocom';
import crypto from 'crypto';
import bs58 from 'bs58';
import { Box } from '@chakra-ui/react';

import QRCode from 'qrcode';

const SMARTHEALTH_CARD_CRED_TYPE = 'https://smarthealth.cards#covid19';

const IndexPage: React.FC = () => {
  const { account, resolver, did } = useIdentity();

  const [fhirDocument, setFhirDocument] = useState<any>();
  const [, setInteractionToken] = useState<string>();

  const [offerJwt, setOfferJwt] = useState<string>();
  const [offerJwtQrCode, setOfferJwtQrCode] = useState<string>();

  const offerResponseReceived = async (response: SignedCredentialOfferResponseAttrs) => {
    if (resolver && did && account) {
      const receiverDid = await resolver?.resolve(response.did);
      //check that offer response is valid...
      const issuer = new Issuer(resolver, did.id);
      const credential = await issuer.issueCredential(
        receiverDid.id,
        {
          fhirVersion: '4.0.1',
          fhirResource: fhirDocument
        },
        response.selectedCredentials.map((selected) => selected.type)
      );

      const credentialJwt = await issuer.createJwt(credential, account.privateKey);
      console.log(credentialJwt);
      //send that jwt to response.callbackURL
    }
  };
  const onFhirCreated = async (fhirDocument: any) => {
    setFhirDocument(fhirDocument);
    const interactionToken = bs58.encode(crypto.randomBytes(32));
    setInteractionToken(interactionToken);

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
    if (resolver && did && account) {
      const issuer = new Issuer(resolver, did.id);
      const jwt = await issuer.createAnyJwt(offerRequest, account.privateKey);
      const qrCode = await QRCode.toDataURL(jwt);

      setOfferJwt(jwt);
      setOfferJwtQrCode(qrCode);

      const eventSource = new EventSource(`${process.env.REACT_APP_COMM_SERVER}/listen/${interactionToken}`);

      eventSource.addEventListener('credentialOfferResponse', function (event: any) {
        const data: SignedCredentialOfferResponseAttrs = JSON.parse(event.data);
        offerResponseReceived(data);
      });
    }
  };

  return (
    <>
      <FhirImmunizationForm onFhirCreated={onFhirCreated} />
      {offerJwt && (
        <Box>
          <img src={offerJwtQrCode} />
          <code>{offerJwt}</code>
        </Box>
      )}
    </>
  );
};

export default IndexPage;

import { useIdentity } from '@immu/frontend';

// import { Issuer } from '@immu/core';
// import { useState } from 'react';
// import { CredentialOfferRequestAttrs, CredentialRenderTypes, SignedCredentialOfferResponseAttrs } from '@immu/core';
// import crypto from 'crypto';
// import bs58 from 'bs58';
//import QRCode from 'qrcode';
import { Box } from '@chakra-ui/react';


const SMARTHEALTH_CARD_CRED_TYPE = 'https://smarthealth.cards#covid19';

type FHIRDocument = any;

const RequestPresentationPage: React.FC = () => {
  const { account, resolver, did, verifier } = useIdentity();

  return (
   <Box>Hello {did?.id}</Box>
  );
};

export default RequestPresentationPage;

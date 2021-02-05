import { Heading } from '@chakra-ui/react';
import { JWTVerified } from '@immu/core';
import AcceptPresentationRequest from 'organisms/AcceptPresentationRequest';
import RespondToPresentationRequest from 'organisms/RespondToPresentationRequest';
import React, { useState } from 'react';

const IndexPage: React.FC = () => {
  const [presentationRequest, setPresentationRequest] = useState<JWTVerified>();

  return (
    <div>
      <Heading size="lg">prove immunization</Heading>

      {presentationRequest ? (
        <RespondToPresentationRequest presentationRequest={presentationRequest} />
      ) : (
        <AcceptPresentationRequest onAccepted={setPresentationRequest} />
      )}
    </div>
  );
};

export default IndexPage;

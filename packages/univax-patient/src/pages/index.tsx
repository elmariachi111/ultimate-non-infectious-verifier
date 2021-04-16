import { Box, Heading } from '@chakra-ui/react';
import { JWTVerified } from '@univax/core';
import AcceptPresentationRequest from 'organisms/AcceptPresentationRequest';
import RespondToPresentationRequest from 'organisms/RespondToPresentationRequest';

import React, { useState } from 'react';

const IndexPage: React.FC = () => {
  const [presentationRequest, setPresentationRequest] = useState<JWTVerified>();

  return (
    <Box mt={6}>
      <Heading size="lg">prove that you're immune</Heading>

      {presentationRequest ? (
        <RespondToPresentationRequest
          cancel={() => setPresentationRequest(undefined)}
          presentationRequest={presentationRequest}
        />
      ) : (
        <AcceptPresentationRequest onAccepted={setPresentationRequest} />
      )}
    </Box>
  );
};

export default IndexPage;

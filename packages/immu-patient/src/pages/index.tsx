import { Box, Heading } from '@chakra-ui/react';
import { JWTVerified } from '@immu/core';
import AcceptPresentationRequest from 'organisms/AcceptPresentationRequest';
import RespondToPresentationRequest from 'organisms/RespondToPresentationRequest';

import React, { useState } from 'react';

const IndexPage: React.FC = () => {
  const [presentationRequest, setPresentationRequest] = useState<JWTVerified>();

  return (
    <div>
      <Box my={3}>
        <Heading size="lg">prove that you're immune</Heading>

        {presentationRequest ? (
          <RespondToPresentationRequest presentationRequest={presentationRequest} />
        ) : (
          <AcceptPresentationRequest onAccepted={setPresentationRequest} />
        )}
      </Box>
    </div>
  );
};

export default IndexPage;

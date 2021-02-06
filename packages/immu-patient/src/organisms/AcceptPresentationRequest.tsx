import { Box, Button, FormControl, FormHelperText, FormLabel, Textarea } from '@chakra-ui/react';
import { useIdentity } from '@immu/frontend';
import React from 'react';
import { JWTVerified } from '@immu/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AcceptPresentationRequest = ({ onAccepted }: { onAccepted: (verified: JWTVerified) => void }) => {
  const { verifier } = useIdentity();

  const submitted = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      presentationRequest: { value: string };
    };
    const req = target.presentationRequest.value;

    const verified = await verifier?.verifyAnyJwt(req);
    if (verified) {
      onAccepted(verified);
    }

    target.presentationRequest.value = '';
  };

  return (
    <Box>
      <form onSubmit={submitted}>
        <FormControl id="presentationRequest">
          <FormLabel>presentationRequest</FormLabel>
          <Textarea name="presentationRequest"></Textarea>
          <FormHelperText>Paste an presentation request</FormHelperText>
        </FormControl>
        <Button type="submit" colorScheme="teal">
          submit
        </Button>
      </form>
    </Box>
  );
};

export default AcceptPresentationRequest;

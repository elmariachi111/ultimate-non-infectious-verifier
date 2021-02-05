import { Box, Button, FormControl, FormHelperText, FormLabel, Textarea } from '@chakra-ui/react';
import { useIdentity } from 'context/IdentityContext';
import React from 'react';
import { JWTVerified } from '@immu/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AcceptPresentationRequest = ({ onAccepted }: { onAccepted: (verified: JWTVerified) => void }) => {
  const { verifier } = useIdentity();

  const submitted = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      authenticationRequest: { value: string };
    };
    const req = target.authenticationRequest.value;

    const verified = await verifier?.verifyAnyJwt(req);
    if (verified) {
      onAccepted(verified);
    }

    target.authenticationRequest.value = '';
  };

  return (
    <Box>
      <form onSubmit={submitted}>
        <FormControl id="authenticationRequest">
          <FormLabel>authenticationRequest</FormLabel>
          <Textarea name="authenticationRequest"></Textarea>
          <FormHelperText>Paste an authentication request</FormHelperText>
        </FormControl>
        <Button type="submit" colorScheme="teal">
          submit
        </Button>
      </form>
    </Box>
  );
};

export default AcceptPresentationRequest;

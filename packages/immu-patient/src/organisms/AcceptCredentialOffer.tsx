import { Box, Button, FormControl, FormHelperText, FormLabel, Textarea } from '@chakra-ui/react';
import { useIdentity } from '@immu/frontend';
import React from 'react';
import { JWTVerified } from '@immu/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AcceptCredentialOffer = ({ onAccepted }: { onAccepted: (verified: JWTVerified) => void }) => {
  const { verifier } = useIdentity();

  const submitted = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      credentialOffer: { value: string };
    };
    const req = target.credentialOffer.value;

    const verified = await verifier?.verifyAnyJwt(req);
    if (verified) {
      onAccepted(verified);
    }

    target.credentialOffer.value = '';
  };

  return (
    <Box>
      <form onSubmit={submitted}>
        <FormControl id="credentialOffer">
          <FormLabel>credential offer</FormLabel>
          <Textarea name="credentialOffer"></Textarea>
          <FormHelperText>Paste a credential offer</FormHelperText>
        </FormControl>
        <Button type="submit" colorScheme="teal">
          submit
        </Button>
      </form>
    </Box>
  );
};

export default AcceptCredentialOffer;

import React, { FormEvent } from 'react';
import { useIdentity } from 'context/IdentityContext';
import { Box, Button, FormControl, FormHelperText, FormLabel, Textarea } from '@chakra-ui/react';

const Authenticate = () => {
  const { did } = useIdentity();

  const submitted = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      authenticationRequest: { value: string };
    };
    const req = target.authenticationRequest.value;

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

export default Authenticate;

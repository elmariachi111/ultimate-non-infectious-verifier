import { Box, Flex, Heading, Spacer, Text } from '@chakra-ui/react';
import { useIdentity } from 'context/IdentityContext';
import { useWeb3 } from 'context/Web3Context';
import React from 'react';

const Navbar = () => {
  const { account, did } = useIdentity();

  const { chainId } = useWeb3();

  return (
    <Flex bg="black" color="white">
      <Box p="2">
        <Heading size="md">Hello, Patient</Heading>
      </Box>
      <Spacer />
      <Box>
        <Text>
          {account?.address} | {did?.id} | chainId: {chainId}
        </Text>
      </Box>
    </Flex>
  );
};

export default Navbar;

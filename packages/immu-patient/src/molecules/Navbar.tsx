import { Box, Flex, Heading, Spacer, Text } from '@chakra-ui/react';
import { useIdentity } from '@immu/frontend';
import { useWeb3 } from '@immu/frontend';
import React from 'react';
import { Link } from 'react-router-dom';
const Navbar = () => {
  const { account, did } = useIdentity();

  const { chainId } = useWeb3();

  return (
    <Flex bg="black" color="white">
      <Box p="2">
        <Heading size="md">
          <Link to="/">Hello, Patient</Link>
        </Heading>
      </Box>
      <Spacer />
      <Box>
        <Text>
          {account?.address} | {did?.id} | chainId: {chainId}
        </Text>
      </Box>
      <Box>
        <Link to="/credentials">Credentials</Link>
      </Box>
    </Flex>
  );
};

export default Navbar;

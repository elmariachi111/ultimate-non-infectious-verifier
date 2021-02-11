import { Box, Flex, Heading, Spacer, Tooltip } from '@chakra-ui/react';
import { useIdentity } from '@immu/frontend';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Identicon from 'react-identicons';

const Navbar = () => {
  const { did } = useIdentity();

  return (
    <Flex bg="teal.900" minH="60px" color="teal.300" direction="row" p={2} align="center">

      <Tooltip hasArrow label={did} bg="black">
        <Flex direction="row" align="center" gap="md">
          <Box p="2">
            <Identicon string={did} size={40} />
          </Box>

          <Heading size="md" color="white">
            Verifier
            </Heading>
        </Flex>
      </Tooltip>

      <Spacer />
    </Flex>
  );
};

export default Navbar;

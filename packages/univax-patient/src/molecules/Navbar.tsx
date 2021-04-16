import { Box, Flex, Heading, HStack, Spacer, Tooltip } from '@chakra-ui/react';
import { NavButton, useIdentity } from '@univax/frontend';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Identicon from 'react-identicons';

const Navbar = () => {
  const { did } = useIdentity();

  return (
    <Flex bg="teal.900" minH="60px" color="teal.300" direction="row" p={2} align="center">
      <Flex direction="row" align="center">
        <Tooltip hasArrow label={did} bg="black">
          <Box p="2">
            <NavButton to="/">
              <Identicon string={did} size={40} />
            </NavButton>
          </Box>
        </Tooltip>

        <Heading size="md" color="white">
          Patient Wallet
        </Heading>
      </Flex>

      <Spacer />
      <HStack>
        <NavButton to="/credentials">Your Credentials</NavButton>
        <NavButton to="/">Present</NavButton>
      </HStack>
    </Flex>
  );
};

export default Navbar;

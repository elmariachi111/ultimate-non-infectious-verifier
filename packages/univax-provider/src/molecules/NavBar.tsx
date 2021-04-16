import { Box, Flex, Heading, HStack, Link, Spacer, Tooltip } from '@chakra-ui/react';
import { useIdentity, NavButton } from '@univax/frontend';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Identicon from 'react-identicons';

const Navbar = () => {
  const { did } = useIdentity();

  return (
    <Flex bg="teal.900" minH="60px" color="teal.300" direction="row" p={2} align="center">
      <Flex direction="row" align="center" gap="md">
        <Tooltip hasArrow label={did} bg="black">
          <Box p="2">
            <Identicon string={did} size={40} />
          </Box>
        </Tooltip>
        <Heading size="md" color="white">
          Provider
        </Heading>
      </Flex>

      <Spacer />

      <HStack h="100%" divider={<Spacer borderColor="transparent" />}>
        <NavButton to="/">Issue</NavButton>
        <NavButton to="/credentials">You</NavButton>
      </HStack>
    </Flex>
  );
};

export default Navbar;

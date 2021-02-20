import { Box, Flex, Heading, HStack, Link, Spacer, Tooltip } from '@chakra-ui/react';
import { useIdentity } from '@univax/frontend';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Identicon from 'react-identicons';
import { NavLink } from 'react-router-dom';

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
            Provider
          </Heading>
        </Flex>
      </Tooltip>

      <Spacer />

      <HStack>
        <Link as={NavLink} to="/">
          Issue
        </Link>
        <Spacer />
        <Link as={NavLink} to="/credentials">
          You
        </Link>
      </HStack>
    </Flex>
  );
};

export default Navbar;

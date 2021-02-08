import { Box, Link, Flex, Heading, HStack, Spacer, Tooltip } from '@chakra-ui/react';
import { useIdentity } from '@immu/frontend';

import React from 'react';
import { Link as RLink, NavLink } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Identicon from 'react-identicons';

const Navbar = () => {
  const { did } = useIdentity();

  return (
    <Flex bg="teal.900" minH="60px" color="teal.300" direction="row" p={2} align="center">
      <Flex direction="row" align="center">
        <Box p="2">
          <Tooltip hasArrow label={did} bg="black">
            <RLink to="/">
              <Identicon string={did} size={40} />
            </RLink>
          </Tooltip>
        </Box>

        <Heading size="md" color="white">
          Patient Wallet
        </Heading>
      </Flex>

      <Spacer />
      <HStack>
        <Link as={NavLink} to="/credentials">
          Your Credentials
        </Link>
        <Link as={NavLink} to="/">
          Present
        </Link>
      </HStack>
    </Flex>
  );
};

export default Navbar;

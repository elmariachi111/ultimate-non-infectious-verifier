import { Box, Link, Flex, Heading, HStack, Spacer, Text, Tooltip } from '@chakra-ui/react';
import { useIdentity } from '@immu/frontend';
import { useWeb3 } from '@immu/frontend';
import React from 'react';
import { Link as RLink, NavLink } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Identicon from 'react-identicons';

const Navbar = () => {
  const { account, did } = useIdentity();

  const { chainId } = useWeb3();

  return (
    <Flex bg="teal.900" minH="60px" color="teal.300" direction="row" p={2} align="center">
      {did && (
        <Tooltip hasArrow label={did.id} bg="black">
          <RLink to="/">
            <Identicon string={did.id} size={40} />
          </RLink>
        </Tooltip>
      )}

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

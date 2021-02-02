import { Box, Container, Heading, Text, Textarea } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useIdentity } from 'context/IdentityContext';
import { useWeb3 } from 'context/Web3Context';
import { DIDDocument } from '@immu/core';
import Authenticate from 'organisms/Authenticate';

const IndexPage: React.FC = () => {
  const i = 0;
  const { account, did } = useIdentity();

  const { web3, chainId } = useWeb3();

  return (
    <div>
      <Heading size="lg">acquire immunization</Heading>
      <Text>
        hello {account?.address} | {did?.id} | chainId: {chainId}
      </Text>

      <Authenticate />
    </div>
  );
};

export default IndexPage;

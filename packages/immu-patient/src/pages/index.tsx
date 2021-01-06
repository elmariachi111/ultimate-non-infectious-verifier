import { Box, Container, Heading, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useIdentity } from 'context/IdentityContext';
import { useWeb3 } from 'context/Web3Context';

const IndexPage: React.FC = () => {
  const i = 0;
  const { account } = useIdentity();

  const { web3 } = useWeb3();

  const [block, setBlock] = useState(0);
  web3.eth.getBlockNumber().then(setBlock);

  return (
    <div>
      <Heading size="lg">acquire immunization</Heading>
      <Text>hello {block}</Text>
    </div>
  );
};

export default IndexPage;

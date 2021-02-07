import { Flex, Text } from '@chakra-ui/react';
import { CredentialPayload } from '@immu/core';
import React from 'react';

const CredentialCard = ({ credential }: { credential: CredentialPayload }) => {
  const bg = 'gray.500';
  return (
    <Flex
      direction="column"
      justify="space-around"
      bg={bg}
      minHeight="3xs"
      minW="100%"
      maxW="lg"
      borderRadius="lg"
      border="1px"
      borderBottom="4px solid"
      borderColor="teal.500"
    >
      <Text opacity={0.8} textAlign="center" bg="gray.200" py={4}>
        {credential.type}
      </Text>
    </Flex>
  );
};

export default CredentialCard;

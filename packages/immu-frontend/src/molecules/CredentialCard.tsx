import { Box, Code, Flex, Heading, Text } from '@chakra-ui/react';
import { VerifiableCredential } from '@immu/core';
import React from 'react';

const CredentialCard = ({
  credential,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onSelect = () => {}
}: {
  credential: VerifiableCredential;
  //bg: string;
  onSelect?: (credential: VerifiableCredential) => unknown;
}) => {
  const bg = 'teal.300';

  if (typeof credential === 'string') throw Error('noooo');

  const { fhirResource } = credential.credentialSubject;
  const vm: Record<string, any> = {
    types:
      typeof credential.type === 'string'
        ? [credential.type]
        : credential.type.filter((t) => t !== 'VerifiableCredential'),
    issued: new Date(credential.issuanceDate).toLocaleDateString(),
    resourceType: fhirResource.resource.resourceType,
    issuer: credential.issuer.id
  };

  if (fhirResource.resource.occurrenceDateTime) {
    vm.occurred = new Date(fhirResource.resource.occurrenceDateTime).toISOString()
  }

  return (
    <Flex
      direction="column"
      justify="space-evenly"
      bg={bg}
      minHeight="3xs"
      minW="100%"
      maxW="lg"
      pt={4}
      borderRadius="lg"
      border="1px"
      borderBottom="4px solid"
      borderColor="teal.500"
      overflow="hidden"
      onClick={() => onSelect(credential)}
    >
      {vm.types.map((type: string) => (
        <Text opacity={0.8} textAlign="center" bg="gray.200" py={4}>
          {type}
        </Text>
      ))}
      <Box px={4}>
        <Heading size="xs">{vm.resourceType} </Heading>
        {vm.occurred && <Text fontSize="sm">
          occurred on <b>{vm.occurred}</b>
        </Text>}
        <Text fontSize="sm">
          issued on: <b>{vm.issued}</b>{' '}
        </Text>
      </Box>
      <Box align="center" w="100%" overflow="hidden" px={2}>
        <Code colorScheme="whiteAlpha" variant="solid" fontSize="xs">
          {vm.issuer}{' '}
        </Code>
      </Box>
    </Flex>
  );
};

export default CredentialCard;

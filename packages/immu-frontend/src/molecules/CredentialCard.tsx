import { Box, Code, Flex, Heading, Text } from '@chakra-ui/react';
import { Covid19, VerifiableCredential } from '@immu/core';
import React, {useEffect, useState} from 'react';
import { useCredentialVerifier } from '..';

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

  const {credentialVerifier} = useCredentialVerifier();
  const [immunization, setImmunization] = useState<Covid19.CovidImmunization>();

  useEffect(() => {
    (async () => {
      try {
        const iCheckCredentials = credentialVerifier.getStrategy(credential.type);
        setImmunization(await iCheckCredentials.checkCredential(credential));
      } catch(e) {
        console.debug(e.message)
      }
    })()
  }, [])

  const vm: Record<string, any> = {
    types:
      typeof credential.type === 'string'
        ? [credential.type]
        : credential.type.filter((t) => t !== 'VerifiableCredential'),
    issued: new Date(credential.issuanceDate).toLocaleDateString(),
    issuer: credential.issuer.id
  }; 

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
        <Text key={`type-${type}`} opacity={0.8} textAlign="center" bg="gray.200" py={4}>
          {type}
        </Text>
      ))}
      <Box px={4}>
        <Heading size="xs">{vm.resourceType} </Heading>
        {immunization && 
          <>
            <Text fontSize="sm">
              vaccine: <b>{immunization.cvx?.shortDescription}</b>
            </Text>
            <Text fontSize="sm">
              sequence: {immunization.doseSequence}
            </Text>
            <Text fontSize="sm">
              occurred on <b>{immunization.occurrenceDateTime.toLocaleDateString()}</b>
            </Text>
          </>
        }
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

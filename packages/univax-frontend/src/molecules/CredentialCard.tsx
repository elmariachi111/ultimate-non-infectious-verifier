import { Box, Code, Flex, Heading, Text } from '@chakra-ui/react';
import { Covid19, VerifiableCredential } from '@univax/core';
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
      bgGradient="linear(to-br, teal.300, teal.500)"
      minHeight="3xs"
      minW="100%"
      maxW="lg"
      pt={4}
      borderRadius="xl"
      borderBottom="3px solid"
      borderColor="teal.600"
      overflow="hidden"
      onClick={() => onSelect(credential)}
    >
      {vm.types.map((type: string) => (
        <Text 
          key={`type-${type}`} textAlign="center" py={4}
          color="white"
          fontSize="xl"
          textShadow="#FFF 0px 0px 2px"
          >
          {type}
        </Text>
      ))}
      <Box px={4} my={4}>
        <Heading size="xs">{vm.resourceType} </Heading>
        {immunization && 
          <>
            <Text >
              vaccine: <b>{immunization.cvx?.shortDescription}</b>
            </Text>
            <Text >
              sequence: <b>{immunization.doseSequence}</b>
            </Text>
            <Text >
              occurred on <b>{immunization.occurrenceDateTime.toLocaleDateString()}</b>
            </Text>
          </>
        }
        <Text>
          issued on: <b>{vm.issued}</b>{' '}
        </Text>
      </Box>
      <Box align="center" w="100%" overflow="hidden" my={3}>
        <Code p={1} colorScheme="white" variant="solid" fontSize="xs" px={2}>
          {vm.issuer}{' '}
        </Code>
      </Box>
    </Flex>
  );
};

export default CredentialCard;

import { Box, Button, Code, Flex, Text } from '@chakra-ui/react';
import { CredentialOffer, DID } from '@univax/core';
import React from 'react';

const CredentialOfferCard = ({
  offer,
  issuer,
  acceptCredentialOffer
}: {
  offer: CredentialOffer;
  issuer?: DID;
  acceptCredentialOffer: (offer: CredentialOffer) => unknown;
}) => {
  const bg = offer.renderInfo?.background?.color || 'gray.100';
  return (
    <Flex
      justify="space-evenly"
      bg={bg}
      direction="column"
      minHeight="3xs"
      minW="100%"
      maxW="lg"
      pt={4}
      borderRadius="xl"
      borderBottom="3px solid"
      borderColor="teal.600"
    >
      <Text textAlign="center" color="white" fontSize="xl" textShadow="#FFF 0px 0px 2px">
        {offer.type}
      </Text>

      <Button colorScheme="teal" mx={2} onClick={() => acceptCredentialOffer(offer)}>
        accept
      </Button>
      <Box align="center" w="100%" overflow="hidden">
        <Code colorScheme="white" variant="solid" fontSize="xs" pt={4}>
          {issuer}
        </Code>
      </Box>
    </Flex>
  );
};

export default CredentialOfferCard;

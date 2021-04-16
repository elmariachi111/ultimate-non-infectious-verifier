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
        {offer.type}
      </Text>

      <Button colorScheme="teal" mx={2} onClick={() => acceptCredentialOffer(offer)}>
        accept
      </Button>
      <Box align="center" w="100%" overflow="hidden" px={2}>
        <Code colorScheme="whiteAlpha" variant="solid" fontSize="xs" p={1}>
          {issuer}
        </Code>
      </Box>
    </Flex>
  );
};

export default CredentialOfferCard;

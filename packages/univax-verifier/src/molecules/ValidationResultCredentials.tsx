import { Box, Heading, VStack } from "@chakra-ui/react";
import { VerifiableCredential } from "@univax/core";
import { CredentialCard } from "@univax/frontend";
import { ValidationResult } from "types/ValidationResult";

const ValidationResultCredentials = ({credentials}: ValidationResult ) => {
  return <Box mt={6}>
    <Heading size="sm" my={2}>Presented Credentials</Heading>
    <VStack spacing={4} align="start">
    {credentials.map((credential) => (
      <CredentialCard credential={credential as VerifiableCredential} />
    ))}
    </VStack>
  </Box>
}

export default ValidationResultCredentials;
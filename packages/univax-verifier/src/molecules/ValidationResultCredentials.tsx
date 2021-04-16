import { Box, Heading } from "@chakra-ui/react";
import { VerifiableCredential } from "@univax/core";
import { CredentialCard } from "@univax/frontend";
import { ValidationResult } from "types/ValidationResult";

const ValidationResultCredentials = ({credentials}: ValidationResult ) => {
  return <Box>
    <Heading size="md">Presented Credentials</Heading>
    {credentials.map((credential) => (
      <CredentialCard credential={credential as VerifiableCredential} />
    ))}
  </Box>
}

export default ValidationResultCredentials;
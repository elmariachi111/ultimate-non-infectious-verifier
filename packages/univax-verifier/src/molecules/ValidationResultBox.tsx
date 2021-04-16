import { Alert, AlertIcon, Box, Button, Heading } from "@chakra-ui/react";
import { ValidationResult } from "types/ValidationResult";

const ValidationResultBox = ({isValid, errorMessage, reset}: ValidationResult & {
  reset: () => void
})  => {

  return(
  <Box background={isValid ? "green.100" : "red.100"} p={3}>
    <Heading size="md" my={2}>Validation Result</Heading>
    <Alert status={isValid ? 'success' : 'error'} variant="solid">
        <AlertIcon />
        {isValid ? "immunization has been proven" : errorMessage}
      </Alert>
      <Button w="100%" my={8} onClick={reset} colorScheme="red">reset</Button>
  </Box>
)
}

export default ValidationResultBox;
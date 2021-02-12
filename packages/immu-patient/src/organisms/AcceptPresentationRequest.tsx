import { Box, Button, Flex, FormControl, FormHelperText, FormLabel, Textarea } from '@chakra-ui/react';
import { useIdentity } from '@immu/frontend';
import React, { useState } from 'react';
import { JWTVerified } from '@immu/core';
import QrReader from 'react-qr-reader';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AcceptPresentationRequest = ({ onAccepted }: { onAccepted: (verified: JWTVerified) => void }) => {
  const { verifier } = useIdentity();
  const [isScanning, setScanning] = useState<boolean>(false);

  const onPresentationRequestReceived = async (value: string) => {
    const verified = await verifier.verifyAnyJwt(value);
    if (verified) {
      onAccepted(verified);
    }
  };

  const submitted = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      presentationRequest: { value: string };
    };
    await onPresentationRequestReceived(target.presentationRequest.value);
    target.presentationRequest.value = '';
  };

  const handleScan = (data: null | string) => {
    if (data) {
      setScanning(false);
      onPresentationRequestReceived(data);
    }
  };

  return (
    <Box>
      <form onSubmit={submitted}>
        <FormControl id="presentationRequest">
          <FormLabel>presentationRequest</FormLabel>
          <Textarea name="presentationRequest"></Textarea>
          <FormHelperText>Paste an presentation request</FormHelperText>
        </FormControl>
        <Flex align="flex-end" justify="space-between">
          <Button type="submit" colorScheme="teal">
            submit
          </Button>
          <Button type="button" colorScheme="teal" onClick={() => setScanning(!isScanning)}>
            {isScanning ? 'stop' : 'scan'}
          </Button>
        </Flex>
      </form>

      {isScanning && (
        <div>
          <QrReader
            delay={300}
            onError={console.error}
            onScan={handleScan}
            showViewFinder={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}
    </Box>
  );
};

export default AcceptPresentationRequest;

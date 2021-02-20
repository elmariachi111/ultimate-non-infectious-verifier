import { Box, Button, Code, Divider, Heading, Text, VStack } from '@chakra-ui/react';
import { Verifiable, W3CCredential } from '@univax/core';
import { useIdentity, CredentialCard } from '@univax/frontend';
import React, { useEffect, useState } from 'react';

const CredentialPage: React.FC = () => {
  const { did, resolver, registry, account, chainId } = useIdentity();

  const { web3, contract } = registry.getDidRegistry(chainId);

  const [balance, setBalance] = useState<number>(0);
  const [didDoc, setDidDoc] = useState<any>();
  const [credentials, setCredentials] = useState<Verifiable<W3CCredential>[]>([]);

  const credentialServiceEntry = didDoc?.service?.find((svc: any) => svc.type === 'CredentialService');

  useEffect(() => {
    (async () => {
      const didDoc = await resolver.resolve(did);
      setDidDoc(didDoc);
      console.log(didDoc);

      const _balance = await web3.eth.getBalance(account.address);
      setBalance(parseFloat(web3.utils.fromWei(_balance, 'ether')));
    })();
  }, [did, resolver]);

  useEffect(() => {
    if (credentialServiceEntry) {
      lookupPractitionerCredential(credentialServiceEntry.serviceEndpoint);
    }
  }, [credentialServiceEntry]);

  const addService = async () => {
    const abi = await registry.addServiceTransaction(
      'CredentialService',
      `${process.env.REACT_APP_COMM_SERVER}/vc`,
      account.address,
      chainId
    );
    const signedTx = await web3.eth.accounts.signTransaction(
      {
        data: abi,
        to: contract.options.address,
        gas: 2000000
      },
      account.privateKey
    );
    if (signedTx.rawTransaction) {
      const sentTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(sentTx);
    }
  };

  const lookupPractitionerCredential = async (serviceEndpoint: string) => {
    const credentialType = 'ProofOfProvider';
    const credentialQuery = await fetch(`${serviceEndpoint}/${did}?vctype=${credentialType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (credentialQuery.status === 404) {
      setCredentials([]);
    } else {
      const credentials = await credentialQuery.json();
      setCredentials(credentials);
    }
  };

  return (
    <Box>
      <Heading size="lg" mt={6}>
        Your Credentials
      </Heading>
      {credentialServiceEntry ? (
        <>
          <Text>
            Others can retrieve credentials about you from <Code>{credentialServiceEntry.serviceEndpoint}</Code>
          </Text>
          <VStack spacing={4} mt={6} align="start">
            {credentials.map((c, i) => (
              <CredentialCard credential={c} key={`c-${i}`} />
            ))}
          </VStack>
          {credentials.length === 0 && (
            <Text>
              No one has issued a <Code>ProofOfProvider</Code> credential for you. Ask an authority to issue one for you
              using your did <Code>{did}</Code> as subject, <Code>ProofOfProvider</Code> as type and <Code>POST</Code>{' '}
              it to <Code>{credentialServiceEntry.serviceEndpoint}</Code>
            </Text>
          )}
          <Button
            size="sm"
            colorScheme="teal"
            onClick={() => lookupPractitionerCredential(credentialServiceEntry.serviceEndpoint)}
          >
            refresh{' '}
          </Button>
        </>
      ) : (
        <Box my={6}>
          <Heading size="lg" mt={6}>
            VC Service entry
          </Heading>

          {balance > 0 ? (
            <Button onClick={addService}>add credential registry service entry</Button>
          ) : (
            <Text>
              to add a service entry, fund your controller address <Code>{account.address}</Code>
              with some Eth on network <Code>{chainId}</Code>
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CredentialPage;

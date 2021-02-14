import { Box, Button, Code, Text } from '@chakra-ui/react';
import { Verifiable, W3CCredential } from '@immu/core';
import { useIdentity, CredentialCard } from '@immu/frontend';
import React, { useEffect, useState } from 'react';

const CredentialPage: React.FC = () => {
  const { did, resolver, registry, account, chainId } = useIdentity();

  const { web3, contract } = registry.getDidRegistry(chainId);

  const [balance, setBalance] = useState<string>();
  const [didDoc, setDidDoc] = useState<any>();
  const [credentials, setCredentials] = useState<Verifiable<W3CCredential>[]>();

  const serviceEntry = didDoc?.service?.find((svc: any) => svc.type === 'CredentialService');

  useEffect(() => {
    (async () => {
      const didDoc = await resolver.resolve(did);
      setDidDoc(didDoc);
      console.log(didDoc);

      const balance = await web3.eth.getBalance(account.address);
      setBalance(balance);
    })();
  }, [did, resolver]);

  const addService = async () => {
    const abi = await registry.addServiceTransaction(
      'CredentialService',
      'http://localhost:8080/vc',
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

  const lookupPractitionerCredential = async () => {
    const credentialType = 'ProofOfProvider';
    const credentialQuery = await fetch(`${serviceEntry.serviceEndpoint}/${did}?vctype=${credentialType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const credentials = await credentialQuery.json();
    setCredentials(credentials);
  };

  return (
    <Box>
      <Text>Hello {did}</Text>

      {serviceEntry ? (
        credentials ? (
          credentials.map((c) => <CredentialCard credential={c} />)
        ) : (
          <Text>
            Credentials about you can be retrieved from <Code>{serviceEntry.serviceEndpoint}</Code>
            <Button onClick={lookupPractitionerCredential}>Find your Practitioner Credential</Button>
          </Text>
        )
      ) : (
        <Button onClick={addService}>add service entry</Button>
      )}

      <Text>{balance}</Text>
    </Box>
  );
};

export default CredentialPage;

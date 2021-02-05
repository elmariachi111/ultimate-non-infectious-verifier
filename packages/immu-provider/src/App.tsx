import React from 'react';
import { Container } from '@chakra-ui/react';

import { IdentityProvider, useIdentity } from '@immu/frontend';
import { Web3Provider } from '@immu/frontend';

function IdAware() {
  const { did } = useIdentity();
  return <p>{did && did.id}</p>;
}
function App() {
  return (
    <Web3Provider>
      <IdentityProvider>
        <Container>
          <IdAware />
        </Container>
      </IdentityProvider>
    </Web3Provider>
  );
}

export default App;

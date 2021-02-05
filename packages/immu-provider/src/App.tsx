import { Container } from '@chakra-ui/react';
import { IdentityProvider, Web3Provider } from '@immu/frontend';
import IndexPage from 'pages/IndexPage';
import React from 'react';

function App() {
  return (
    <Web3Provider>
      <IdentityProvider>
        <Container>
          <IndexPage />
        </Container>
      </IdentityProvider>
    </Web3Provider>
  );
}

export default App;

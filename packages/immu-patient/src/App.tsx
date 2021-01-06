import { Container } from '@chakra-ui/react';
import React from 'react';
import { IdentityProvider } from 'context/IdentityContext';
import { Web3Provider } from 'context/Web3Context';
import IndexPage from './pages';

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

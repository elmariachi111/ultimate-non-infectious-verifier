import { Container } from '@chakra-ui/react';
import React from 'react';
import { IdentityProvider } from '@immu/frontend';
import { Web3Provider } from '@immu/frontend';
import IndexPage from './pages';
import Navbar from 'molecules/Navbar';

function App() {
  return (
    <Web3Provider>
      <IdentityProvider>
        <Navbar />
        <Container>
          <IndexPage />
        </Container>
      </IdentityProvider>
    </Web3Provider>
  );
}

export default App;

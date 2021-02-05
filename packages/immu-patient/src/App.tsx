import { Container } from '@chakra-ui/react';
import React from 'react';
import { IdentityProvider } from 'context/IdentityContext';
import { Web3Provider } from 'context/Web3Context';
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

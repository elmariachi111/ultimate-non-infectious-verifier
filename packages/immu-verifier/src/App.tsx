import { Container } from '@chakra-ui/react';
import { IdentityProvider, Web3Provider } from '@immu/frontend';
import Navbar from 'molecules/NavBar';
import RequestPresentationPage from 'pages/RequestPresentationPage';
import React from 'react';

function App() {
  return (
    <Web3Provider>
      <IdentityProvider>
        <Navbar />
        <Container>
          <RequestPresentationPage />
        </Container>
      </IdentityProvider>
    </Web3Provider>
  );
}

export default App;
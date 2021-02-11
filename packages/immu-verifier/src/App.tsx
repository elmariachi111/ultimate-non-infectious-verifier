import { Container } from '@chakra-ui/react';
import { IdentityProvider } from '@immu/frontend';
import Navbar from 'molecules/NavBar';
import RequestPresentationPage from 'pages/RequestPresentationPage';
import React from 'react';

function App() {
  return (

    <IdentityProvider chainId={process.env.REACT_APP_CHAIN_ID}>
      <Navbar />
      <Container>
        <RequestPresentationPage />
      </Container>
    </IdentityProvider>

  );
}

export default App;
import { Container } from '@chakra-ui/react';
import { IdentityProvider } from '@immu/frontend';
import Navbar from 'molecules/NavBar';
import IndexPage from 'pages/IndexPage';
import React from 'react';

function App() {
  return (
    <IdentityProvider chainId={process.env.REACT_APP_CHAIN_ID}>
      <Navbar />
      <Container>
        <IndexPage />
      </Container>
    </IdentityProvider>
  );
}

export default App;

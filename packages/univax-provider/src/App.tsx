import { Container } from '@chakra-ui/react';
import { IdentityProvider, LibP2PProvider } from '@univax/frontend';
import Navbar from 'molecules/NavBar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import React from 'react';
import IndexPage from 'pages/IndexPage';
import CredentialPage from 'pages/CredentialPage';
//import { Web3ReactProvider } from '@web3-react/core';
//const getLibrary = (provider: any): Web3 => new Web3(provider);

function App() {
  return (
    <IdentityProvider chainId={process.env.REACT_APP_CHAIN_ID}>
      <LibP2PProvider rendezvousServer={process.env.REACT_APP_RENDEZVOUS_SERVER}>
        <Router>
          <Navbar />
          <Container>
            <Switch>
              <Route path="/credentials">
                <CredentialPage />
              </Route>
              <Route path="/">
                <IndexPage />
              </Route>
            </Switch>
          </Container>
        </Router>
      </LibP2PProvider>
    </IdentityProvider>
  );
}

export default App;

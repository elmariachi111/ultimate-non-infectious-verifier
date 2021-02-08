import { Container } from '@chakra-ui/react';
import React from 'react';
import { IdentityProvider } from '@immu/frontend';
import IndexPage from './pages';
import Navbar from 'molecules/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import CredentialsPage from 'pages/Credentials';
import { CredentialProvider } from 'hooks/CredentialStorage';

function App() {
  return (
    <IdentityProvider chainId={process.env.REACT_APP_CHAIN_ID}>
      <CredentialProvider>
        <Router>
          <Navbar />
          <Container>
            <Switch>
              <Route path="/credentials">
                <CredentialsPage />
              </Route>
              <Route path="/">
                <IndexPage />
              </Route>
            </Switch>
          </Container>
        </Router>
      </CredentialProvider>
    </IdentityProvider>
  );
}

export default App;

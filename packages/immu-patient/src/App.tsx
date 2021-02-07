import { Container } from '@chakra-ui/react';
import React from 'react';
import { IdentityProvider } from '@immu/frontend';
import { Web3Provider } from '@immu/frontend';
import IndexPage from './pages';
import Navbar from 'molecules/Navbar';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import CredentialsPage from 'pages/Credentials';
import { CredentialProvider } from 'hooks/CredentialStorage';

function App() {
  return (
    <Web3Provider>
      <IdentityProvider>
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
    </Web3Provider>
  );
}

export default App;

# Questions

is the proof part of the vc?  
what's the difference of `vp` and `verfifiablePresentation`? (JWT vs JSON-LD)  
are ethr-did-registry key definitions compat to json-ld-signatures?  
do we need the "assumption" types?  
shall we spike IDX / Keri to setup a chain independent controller resolver?  
when do we need universal resolution?  
What's a DID service, actually?

# Todos

create a presentation request and inline a challenge

test against generic did/vc wallets

create a JSON-LD scheme for an immunization proof

what's that Segment 4 spec of the CCI working group?

use a VC revocation tool like ERC780 /

revoke Credentials using their hash (see: are ld proofs part of that hash?? )

store a remote picture on ipfs that's resolveable by the verifier / part of the credential (or another credential?)

## DID backgrounders

https://www.w3.org/TR/did-core/#a-simple-example
https://www.w3.org/TR/vc-data-model/#proofs-signatures

### Eth based registrars

https://github.com/decentralized-identity/ethr-did-resolver/blob/master/doc/did-method-spec.md
https://github.com/gatacaid/gataca-did-method
https://github.com/cryptonicsconsulting/signor-did-contracts/blob/master/did-method-spec.md
https://lianxi-tech.github.io/monid/ (neu)
https://github.com/SelfKeyFoundation/selfkey-did-ledger/blob/develop/DIDMethodSpecs.md

## flow ideas

https://docs.google.com/drawings/d/13b9sgbuBdMUyieHmv9rLTJEK8jzxQr-jtFhBX3_Ox9E/edit
https://docs.google.com/drawings/d/1WAYKZuJconP5IY7ZivE2VdVv0udourOjaEUOW1Kjs88/edit
https://docs.google.com/drawings/d/1tlYGOYkzx7LOUWkncpYN8j2ZdULznufuDyzinlpTq24/edit

### Ethr DID related projects

https://github.com/uport-project/ethr-did-registry
https://github.com/decentralized-identity/ethr-did-resolver
https://github.com/decentralized-identity/did-jwt
https://github.com/decentralized-identity/did-jwt-vc

based on Joels work:
https://medium.com/uport/erc1056-erc780-an-open-identity-and-claims-protocol-for-ethereum-aef7207bc744

Lightweight Identity:
https://eips.ethereum.org/EIPS/eip-1056

Claims Registry:
https://github.com/ethereum/EIPs/issues/780
followed by:

Verifiable Claims on Ethereum:
https://eips.ethereum.org/EIPS/eip-1812

#### Uport's local ethr did

https://github.com/uport-project/ethr-did

### more VC implementation details

https://www.w3.org/TR/vc-data-model/
https://www.w3.org/TR/vc-imp-guide/

A nonfinal vc http api interface spec
https://github.com/w3c-ccg/vc-http-api

https://w3c-ccg.github.io/vc-extension-registry/#proof-methods
(-> `Ed25519Signature2018` )
A nonfinal vc http api interface spec
https://github.com/w3c-ccg/vc-http-api

### Modern signature libraries:

Microsofts approach looks *very* promising: https://github.com/microsoft/VerifiableCredentials-Crypto-SDK-Typescript

https://github.com/w3c-ccg/lds-jws2020

NaCL DIDs: https://github.com/uport-project/nacl-did
(sig suites: https://github.com/digitalbazaar/vc-js/blob/master/BACKGROUND.md#generating-keys-and-suites)

browser based ed25519: noble
https://github.com/paulmillr/noble-ed25519

How JWS signatures are built: http://www.davedoesdev.com/json-web-signatures-on-node-js/ 

### Digital Bazaars Crypto / LD Suites

Suite Middleware
https://github.com/digitalbazaar/crypto-ld

Ed25519 Suite
https://github.com/digitalbazaar/ed25519-verification-key-2018

More on ED25519:
https://w3c-ccg.github.io/lds-ed25519-2018/

signing VCs (vs-js) lib:
https://github.com/digitalbazaar/vc-js/
https://www.npmjs.com/package/vc-js/v/0.6.4?activeTab=readme

based on W3C draft on Crypto LD signatures:
https://w3c-ccg.github.io/ld-cryptosuite-registry/#ed25519
https://github.com/w3c-ccg

### Linting

https://khalilstemmler.com/blogs/tooling/prettier/
https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/

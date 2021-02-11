# DID immunizations

this project is a proof of concept for interoperable usage of verifiable credentials used to prove aspects of an user. This project concentrates on medical use cases and explicitly strives to demonstrate the usage of W3C compliant DIDs and VCs for an immunization health pass. Our operational goal is to demonstrate that

- we can use (more or less) arbitrary DIDs for authentication and as credential subject
- we can interoperate with more than one user wallet at the same time
- we can support JWT and JSON(-LD) / JWS proofs transparently
- we can handle different flavors of key material verification (e.g. EcDSA256k key checks work differently with Ethereum account keys and plainly generated keys since Ethereum doesn't expose a user's public key)
- we can initiate and handle inter-app operations using DIDComm, Verifiable Presentations and Presentation requests
- we can demonstrate how to look up / query for and validate a chain of arbitrary credentials given we've got trustful did resolvers for their issuers.
- we can work with various concepts of claim schemas: a claim encapsulated inside a credential is not standardized (yet). There are approaches to use FHIR or JSON-LD data and the LF/CCI working group strives to get CDC aboard to agree on and specify on a worldwide standard for "immunization" respectively "attestation" claims that can be used to prove that someone is not infectious.

## project setup / guideline

This is a monorepo built on pnpm workspaces. Get a global pnpm if you haven't got one already https://pnpm.js.org/en/

At the moment we support two DID methods: ethr and key. The ethr method relies on blockchain lookups. We prepared a local ganache chain in the docker-compose file. Run `docker-compose up -d` to bring it up.

Since in development we're relying on a local ethr did registry we must deploy on onto our local ganache blockchain. Cd into `immu-core` and `pnpm run contracts` should to that. Take down its address and put it in your .env.local files (`immu` and `some-website`)

We're using Typescript. Most tsconfigs extends the root tsconfig.json. We rely on eslint and use `dotenv-flow` for env configurations. `.env` are sample files and go into VCS, you override them by `.env.local` files (or your environment ;) ).

There are three main packages relevant at the moment:

### `immu-core`

comes with foundational classes and no interactivity or environmental assumptions. For signing and credential creation is relies on the @transmute crypto libraries and makes use of did-jwt and did-jwt-vc which ar primarily supposed to interact with EcDsa256 keypairs. The library also supports EdDSA25519 signatures and contains code to add and verify ed25519 public keys to a did:ethr identity. The resolver is configured to resolve did:ethr and did:key

### `immu`

is a mostly isolated cli wrapper around immu-core and contains interactive cli tools to interact with the code found in immu-core. Most noteably, we're _not_ really building a cli wallet but for convenience we're relying on the `aliases.json` file that keeps track of public and private keys (based on ganache's public seed `myth like bonus scare over problem client lizard pioneer submit female collect`). Make triple sure to never put any real secret in there! It's going to be removed from VCS when someone adds a little agent / wallet functionality that makes it obsolete. The CLI foundation is `oclif` which ist somewhat proposed by the official Typescript website.

### `immu-frontend`

shared components for frontends, particularly an identity context that yields resolver, issuer and verifier services and creates a randomized local did:ethr 

### `immu-provider`
a provider demo that lets an user provide generic immunization related values. Issues credential offers and reacts to their responses by issuing and transferring credentials to patients.

### `immu-patient`
a patient wallet that allows accepting and presenting credentials.

### `immu-verifier`
a verifier that displays presentiation requests for validateable credential types and validates presented credentials according to all known verification strategies.

## fork of uport's ethr-did-resolver to support base58 verification keys

https://github.com/decentralized-identity/ethr-did-resolver/pull/106 : the resolver would be able to resolve key material in base58 encoding (instead of base64url) as required by most crypto did libraries at the moment.

# Background

## DID backgrounders

https://w3c-ccg.github.io/did-primer/
https://www.w3.org/TR/did-core/#a-simple-example
https://www.w3.org/TR/vc-data-model/#proofs-signatures

The official, generic universal DIF DID resolver:
https://github.com/decentralized-identity/universal-resolver

**Specs & links to lots of Method implementations**
https://w3c.github.io/did-spec-registries/#did-methods

Did resolution process definition
https://w3c-ccg.github.io/did-resolution/

A lot of use case samples (maily non tech) https://www.w3.org/TR/did-use-cases/

Mattr is a cli tool for all kinds of DID / VC ops
https://mattr.global/
APIs: https://learn.mattr.global/

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

### Other DID / SSI wallet approaches worth considering

- [Ceramic / IDX](https://developers.ceramic.network/build/authentication/) is by far the most decentralized and far-though solution for a truly distributed and user controlled identity management. Based on IPFS. In Beta.

- [Sovrin / Evernym](https://sovrin.org/developers/). By far the most advanced and used solution. Runs on a commercial permissioned blockchain. Root anchoring would cost "real" (€) money. Support sub identities and drives DidComm development.

- [Jolocom](https://jolocom.github.io/jolocom-sdk/1.0.0/). Highly involved in the SSI/DID space, drives the INATBA international SSI consortium. Concentrates on DIDComm v2 (open sourced a Rust implementation / JWK, JWM recently)

- [lissi.id](https://lissi.id/). A government driven (and financed) wallet based on Hyperledger (?) with a focus on eIDAS compliance (later). Supported by TU BErlin, Bundesdruckerei, Deutsche Bahn e.a.

- [trinsic.id](https://trinsic.id/) tries to implement standards for Verifiable claims. Also based on Hyperledger standards (Aries). Offers Credential services like issuance, revocation and a studio application to design credential schemas.

- Apple Wallet (sic) also fundamentally builds upon VC schematics.

### Verifiable Credential implementation details

https://www.w3.org/TR/vc-data-model/
https://www.w3.org/TR/vc-imp-guide/

A nonfinal vc http api interface spec
https://github.com/w3c-ccg/vc-http-api

https://w3c-ccg.github.io/vc-extension-registry/#proof-methods
(-> `Ed25519Signature2018` )

DIF specs
https://github.com/decentralized-identity/claims-credentials

#### Verifiable Presentation Requests

https://w3c-ccg.github.io/vp-request-spec/
needed to request a credential from a holder

https://identity.foundation/presentation-exchange/
https://github.com/decentralized-identity/presentation-exchange
https://w3c-ccg.github.io/vp-request-spec/
needed to request a credential from a holder

### Modern signature libraries:

Microsofts approach looks _very_ promising: https://github.com/microsoft/VerifiableCredentials-Crypto-SDK-Typescript

https://github.com/w3c-ccg/lds-jws2020

NaCL DIDs: https://github.com/uport-project/nacl-did
(sig suites: https://github.com/digitalbazaar/vc-js/blob/master/BACKGROUND.md#generating-keys-and-suites)

generic did:key methods Transmute
https://github.com/transmute-industries/did-key.js

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

### Wallets & commercial implementations

trinsic.id (formerly streedcred): wallet, cloud wallet, mobile sdk
https://docs.trinsic.id/docs implements DIDComm / Aries, based on sovrin

Jolocom https://github.com/jolocom/jolocom-sdk . Rinkeby anchored, shines for presentations, migrates to KERI

Evernym Connectme: https://www.evernym.com/products/?#ConnectMe general DID / VC wallet, based on sovrin + mobile wallet sdk

### DID Comm

Defines a transport agnostic, encrypted, eventually signed, routable, fully async protocol to transfer messages between DIDs. 

General Specification for connection interactions: https://didcomm.org/,
https://github.com/decentralized-identity/didcomm-messaging

Specs: https://identity.foundation/didcomm-messaging/spec/

Jolocom's /(DIF) Rust impl
https://github.com/jolocom/didcomm-rs/blob/main/README.md
https://github.com/decentralized-identity/didcomm-rs
(and an earlier js implementation: https://github.com/decentralized-identity/DIDComm-js)

A good overview of supported DID-Auth schemas
https://nbviewer.jupyter.org/github/WebOfTrustInfo/rebooting-the-web-of-trust-spring2018/blob/master/final-documents/did-auth.pdf  
or: 
(https://github.com/WebOfTrustInfo/rwot6-santabarbara/blob/master/final-documents/did-auth.md)  


### Hyperledger Aries 

is a reference impl for DIDComm + information exchange on top of Hyperledger Indy. Most RFCs can be considered de facto standards:

#### The Aries RFC list  
lots of specs that are relevant for interoperable credential exchange protocols. Supposed to be the DIDComm foundation:
https://github.com/hyperledger/aries-rfcs/blob/master/index.md

an early JS implementation:
https://github.com/hyperledger/aries-framework-javascript


#### How to start interactions with an unknown client:

https://github.com/hyperledger/aries-rfcs/blob/master/features/0160-connection-protocol/README.md#0-invitation-to-connect (superseded by: https://github.com/hyperledger/aries-rfcs/blob/master/features/0023-did-exchange/README.md)

ideas of communication, multi clients / keys, encapsulated in a DID doc conventions:
https://github.com/hyperledger/aries-rfcs/blob/master/features/0067-didcomm-diddoc-conventions/README.md

#### exchange 

credentials (1 -> 2):  
old: https://github.com/hyperledger/aries-rfcs/blob/master/features/0036-issue-credential/README.md
https://github.com/hyperledger/aries-rfcs/blob/master/features/0453-issue-credential-v2/README.md

present proof protocol (1 -> 2):
old: https://github.com/hyperledger/aries-rfcs/blob/master/features/0037-present-proof/README.md
https://github.com/hyperledger/aries-rfcs/blob/master/features/0454-present-proof-v2/README.md

message spec: 
https://github.com/hyperledger/aries-rfcs/blob/master/features/0510-dif-pres-exch-attach/README.md
(also see DIF presentation-exchange, above)

out of band protocols (QR Codes): https://github.com/hyperledger/aries-rfcs/blob/master/features/0434-outofband/README.md

### Sovrin

is a public dlt to store DIDs and decentralize vc issuer credentials. https://sovrin.org/test-sovrin-tokens/ based on hyperledger indy.
test directly on indy: https://sovrin.org/wp-content/uploads/Token-Test-Instructions.pdf

### Immunization related schemas

Qatar open data:
https://www.data.gov.qa/explore/dataset/h4-vaccination/information/

FHIR4 Immunization JSON schema
https://www.hl7.org/fhir/immunization.schema.json.html

The preliminary FHIR4 spec, driven by Health cards:
http://build.fhir.org/ig/dvci/vaccine-credential-ig/branches/main/


Using FHIR4 information in health credentials
https://healthwallet.cards/credential-modeling/
https://github.com/microsoft-healthcare-madison/health-wallet-demo/blob/master/src/fixtures/vc.json
Covid 19 sample:

https://github.com/microsoft-healthcare-madison/health-wallet-demo/blob/master/src/fixtures/vc.pcr.json

A ruby impl of health cards
https://github.com/dvci/health_cards


### Vaccination credential initiatives

Linux Foundation Public Health Covid Credential Initiative (LFPH CCI)  
- https://www.covidcreds.org/  
- https://www.lfph.io/2020/12/16/press-release/  
- https://www.youtube.com/watch?v=ionT4gvM4Os

Vaccination Credential Initiative  
(Microsoft, Oracle, Salesforce etc)
- https://vaccinationcredential.org/

IATA Travel Pass Initiative  
- https://www.iata.org/en/programs/passenger/travel-pass/

Digital Immunization Passport  
- https://dapsi.ngi.eu/hall-of-fame/dip/
- https://www.youtube.com/watch?v=fFKeMfYrK8M

Meta.me Hlth.id
https://metame.com/
https://hlthid.com/


David Janes / Consensas
opinion: https://www.yogitatrainingcenter.com/w3c-verifiable-credentials-the-fairly-odd-blueprints-by-david-janes-consensas-feb-2021/

collection / survey of all initiatives:
https://docs.google.com/document/d/1MQfZzlkYkXCXvnUXd7Cd6Y5g0RRXrKxGGqVcbBnSk1k/edit



### OT: Linting TS

https://khalilstemmler.com/blogs/tooling/prettier/
https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/

# Questions

- are ethr-did-registry key definitions compat to json-ld-signatures?
- do we need the "assumption" types?
- shall we spike IDX / Keri to setup a chain independent controller resolver?
- when do we need universal resolution?

# Todos

- let immu-core only operate on *signer* `({data}) => Uint8Array` interfaces and add private key converters for the different key types accordingly (get rid of Signer)

- test against generic did/vc wallets
- add a verifier for Consensa JSON-LD schemes for an immunization proof
- what's that Segment 4 spec of the CCI working group?
- use a VC revocation registry like ERC780 
- revoke Credentials using their hash (see: are ld proofs part of that hash?? )
- store a remote picture on ipfs that's resolveable by the verifier / part of the credential (or another credential?)

# UniVacs

## Universal Non Infectious Verifier for Arbitrary Credential Schemas

https://www.youtube.com/watch?v=GIgTk2ryk8I

This project is a building block for the interoperable usage of [W3C verifiable credentials](https://www.w3.org/TR/vc-data-model/) to prove the immunization status of an user. It makes use of W3C compliant [DIDs](https://w3c.github.io/did-core/) and VCs to verify any kind of immunization health pass that's presented to a verifier. Its operational goals are to provide a high level, extendable SDK/API and sample implementations to:

- allow any verifier app to reliably resolve DIDs, check credential signatures, schema, semantics and the claim's medical content itself
- interoperate with as many user wallets / communication scenarios and credential strategies used by EHRs or health applications on planet earth
- utilize (draft) standards for inter-agent operations, e.g by using Aries/DIDComm, DIFs Universal Resolver, Verifiable Presentations or  Credential Presentation Requests as specified by 
- demonstrate how to look up / query for and validate a chain of arbitrary credentials to ensure the credential issuer can actually be trusted.
- support an extensible range of immunization credential schemas since health credentials aren't internationally standardized (yet, but approaches using FHIR or JSON-LD data are the most promising ones). 

 Linux Foundation / Covid Credentials Initiative ([CCI](https://www.covidcreds.org/)), the Vaccination Credential Initiative ([VCI](https://vaccinationcredential.org/)), [Good Health Pass](https://www.goodhealthpass.org/) are the most well known working groups that strive to specify a worldwide standard for vaccination crdentials, including their creation, derivation and attestation.

### Veriwhat? Decentrawho? Self Sowondering?

If all that "identity" / DID stuff is totally new to you and you need a soft introduction, we've got you covered: [checkout our docs about Verifiable Credentials for health applications](https://github.com/elmariachi111/ultimate-non-infectious-verifier/blob/main/docs/Decentralized%20Identity.md). It should explain most concepts rather well and contains even more pointers to basic concepts.

## project setup

This is a monorepo built on pnpm workspaces. [Get a global pnpm](https://pnpm.js.org/en/) if you haven't got one already by:

```
npm install -g pnpm
```

At the moment we support two DID methods: ethr and key. The ethr method relies on blockchain lookups. We prepared a local ganache chain in the docker-compose file. Run `docker-compose up -d` to bring it up.

Since during development we're relying on a local ethr did registry we must deploy a registry on our local ganache blockchain. Cd into `univax-core` and `pnpm run contracts` should to that. Take down the deployed contrat's address and put it in your .env.local files.

We're using Typescript. Most tsconfigs extend the root tsconfig.json. We rely on eslint and use `dotenv-flow` for env configurations. `.env` are sample files and go into VCS, you override them by `.env.local` files.

These are the main packages relevant at the moment:

### `univax-core`

comes with foundational classes and no interactivity or environmental assumptions. For signing and credential creation is relies on the @transmute crypto libraries and makes use of did-jwt and did-jwt-vc which are primarily supposed to interact with EcDsa256 keypairs. The library also supports EdDSA25519 signatures and contains code to add and verify ed25519 public keys to a did:ethr identity. The resolver is configured to resolve did:ethr (on any network, when providing an Infura API key) and did:key. 

### `univax-cli`

is a mostly isolated cli demonstrating the use of univax-core. Contains interactive tools to interact with the code found in univax-core. Most noteably, we're _not_ really building a cli wallet but for convenience we're relying on the `aliases.json` file that keeps track of public and private keys (based on ganache's public seed `myth like bonus scare over problem client lizard pioneer submit female collect`). Make triple sure to **never put any real secret into the aliases.json file**! It's going to be removed from VCS when someone adds a little agent / wallet functionality that makes it obsolete. The CLI foundation is [Oclif](https://oclif.io/) which is somewhat proposed by the official Typescript website.

### `univax-comm`

is a preliminary, very light weight backend server that offers two APIs:

- `comm` is a non-standard, [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) based backbone for asynchronous client communication. Roughly related to DidComm (but not compatible!) and highly inspired by [Jolocom's interaction tokens](https://github.com/jolocom/jolocom-lib/tree/develop/ts/interactionTokens) flow.

- `vc` is a proprietary verifiable credential registry that we use to request credentials that are not presented by the prover herself, e.g. to lookup credentials that someone has claimed about the issuer (doctor).

### `univax-frontend`

provides shared components for frontends, particularly an identity context that yields resolver, issuer and verifier services. Also adds hooks that create a randomized local did:ethr and offers local credential storage (for provider and patient).

### `univax-provider`
a provider demo that lets an user provide generic immunization related values. Issues credential offers and reacts to their responses by issuing and transferring credentials to patients.

### `univax-patient`
a patient wallet that allows accepting and presenting credentials.

### `univax-verifier`
a verifier that displays presentiation requests for validateable credential types and validates presented credentials according to all known verification strategies.

## flow ideas

https://docs.google.com/drawings/d/13b9sgbuBdMUyieHmv9rLTJEK8jzxQr-jtFhBX3_Ox9E/edit
https://docs.google.com/drawings/d/1WAYKZuJconP5IY7ZivE2VdVv0udourOjaEUOW1Kjs88/edit
https://docs.google.com/drawings/d/1tlYGOYkzx7LOUWkncpYN8j2ZdULznufuDyzinlpTq24/edit

# Immunization related specs

## Vaccination credential initiatives

An umbrella initiative for VCI / CCI and others is the Good Health Collaborative:
https://www.goodhealthpass.org/ , comes with a  [whitepaper](https://www.goodhealthpass.org/wp-content/uploads/2021/02/Good-Health-Pass-Collaborative-Principles-Paper.pdf) and a [Blueprint Draft](https://wiki.trustoverip.org/download/attachments/76241/GHPC%20Interoperability%20Blueprint_v1.0.0_June%207%202021.pdf)

https://www.goodhealthpass.org/wp-content/uploads/2021/03/GHPC-Interoperability-Blueprint-Outline-v2.pdf

Linux Foundation Public Health Covid Credential Initiative (LFPH CCI)  
- https://www.covidcreds.org/  
- https://www.lfph.io/2020/12/16/press-release/  
- https://www.youtube.com/watch?v=ionT4gvM4Os

Vaccination Credential Initiative  
(Microsoft, Oracle, Salesforce etc)
- https://vaccinationcredential.org/

European Health Network (EHN) Specs and Reference implementations  
https://github.com/ehn-digital-green-development
https://github.com/ehn-dcc-development
https://github.com/ehn-dcc-development/ehn-dcc-schema

Spherity / SAP Reopen
- https://devpost.com/software/reopen-einfuhrung-von-sars-cov-2-antigen-schnelltest-passen

IATA Travel Pass Initiative  
- https://www.iata.org/en/programs/passenger/travel-pass/

Digital Immunization Passport  
- https://dapsi.ngi.eu/hall-of-fame/dip/
- https://www.youtube.com/watch?v=fFKeMfYrK8M

Meta.me Hlth.id
https://metame.com/
https://hlthid.com/

Hlth.id also supported in
https://www.healthcerts.gov.sg/

DIVOC is an open standard for vaccination proofs and used all over India
https://divoc.egov.org.in/ and here's their verifier: https://verify.cowin.gov.in/

NY Excelsior Pass (based on IBM's Digital Health Pass)
https://www.business-standard.com/article/current-affairs/with-ibm-help-new-york-first-state-in-us-to-launch-vaccine-passport-121032800535_1.html

David Janes / CCCC4 / Consensas
opinion: https://www.yogitatrainingcenter.com/w3c-verifiable-credentials-the-fairly-odd-blueprints-by-david-janes-consensas-feb-2021/

https://techcrunch.com/2021/01/19/europe-is-working-on-a-common-framework-for-vaccine-passports/

curated list of all vaccination passport providers in the world (David Janes)
https://docs.google.com/document/d/1MQfZzlkYkXCXvnUXd7Cd6Y5g0RRXrKxGGqVcbBnSk1k/edit

a really valuable recording of ID4Africa's April'21 session
https://www.youtube.com/watch?v=2Ud4SWCShDA

a talk by truu / evernym on that matter
https://www.youtube.com/watch?v=iCL5bddCTtI

## Immunization schemas

FHIR4 immunization general
https://www.hl7.org/fhir/immunization.schema.json.html

Paul Knowles' / John Walker's (CCI) effort to bring together jurisdicational dependent and global credential specs:
https://drive.google.com/drive/u/1/folders/1h4vF79KzUY6KipBt3A6kMEboiqcSYtv7

Immunization Schema Survey
https://docs.google.com/document/d/1a4j0-6kJonEfSlX50ZEfAEbx2ab2IW8UuBK8vigsoLU/edit#heading=h.y43f7b8rk9yr

List of paper based vaccine credentials
https://www.lfph.io/wp-content/uploads/2021/03/CCI-Paper-Based-VC-Summit-Summary-Report.pdf

A paper based, compressed credential by PathCheck
https://vaccine-docs.pathcheck.org/
https://github.com/Path-Check/paper-cred/
https://github.pathcheck.org/vial.html

IBM's Digital Health Pass
https://www.ibm.com/products/digital-health-pass

### W3C oriented schemas
https://w3id.org/vaccination/ ->
https://w3c-ccg.github.io/vaccination-vocab/
https://w3c-ccg.github.io/vaccination-vocab/context/v1/index.json
https://w3c-ccg.github.io/vaccination-vocab/context/v1/EU/unstable.json

### Idea of semantic FHIR<->Json-ld pipeline
(John Walker & Mukund Parthasarathy)
https://github.com/SemanticClarity/labtest-results-vocab/

### M$ Smart Health Cards (VCI)
The preliminary FHIR4 spec, driven by M$ Smart Health Cards project & DVCI:
http://build.fhir.org/ig/dvci/vaccine-credential-ig/branches/main/
-> https://github.com/dvci/vaccine-credential-ig

M$ Smart Health Cards initiative bundles FHIR/HL7 information into health credentials
https://github.com/microsoft-healthcare-madison/health-wallet-demo/blob/master/src/fixtures/vc.json
Covid 19 sample:
https://github.com/microsoft-healthcare-madison/health-wallet-demo/blob/master/src/fixtures/vc.pcr.json
(in action: https://smarthealth.cards/credential-modeling/)

http://build.fhir.org/ig/dvci/vaccine-credential-ig/branches/main/

Helpers for FHIR / JSON-LD schematics
https://github.com/fhircat

### Mattr (under W3C umbrella)
unofficial draft of a W3C vaccination model

### Spherity pathogen vocabulary JSON schemas

https://github.com/Spherity/Pathogen-Vocab

### Schema.org oriented schemas

[CCCC4 initiative](https://cccc4.ca/)'s schema, based on a Canadian effort, driven by Consensas e.a.
https://docs.google.com/document/d/1pCyS_lhbMGhOkq1jFEkI_od-9QunURKzGWA7ty5DCII/edit

Schema.org can be utilized for that:
https://schema.org/docs/meddocs.html
https://schema.org/docs/health-lifesci.home.html
https://schema.org/MedicalTherapy

it's impl and extended by Consensas: https://github.com/Consensas/information-passport/blob/main/docs/Vaccination.md
and a sample: https://consensas.world/did/did:cns:ABMY2TCODB.json

### LOINC
yet another weird medical coding standard https://loinc.org/downloads/loinc-table/
Loinc Covid19 specs: https://loinc.org/sars-cov-2-and-covid-19/

### American Immunization Registry Association
https://repository.immregistries.org/resource/hl7-version-2-5-1-implementation-guide-for-immunization-messaging-release-1-5-1/
(slighty unrelated, mainly deals with communication aspects)

### CVC (Canada Vaccine Catalogue) API
https://cvc.canimmunize.ca/docs/#/

## The CDC recommendation for Vaccination codes
https://www.cdc.gov/vaccines/programs/iis/downloads/business-rules.pdf  
pointing to detailed vaccination code sources (CVX / MVX):

CVX (Vacc codes): https://www2a.cdc.gov/vaccines/IIS/IISStandards/vaccines.asp?rpt=cvx
MVX (Vacc manufacturer codes): https://www2a.cdc.gov/vaccines/IIS/IISStandards/vaccines.asp?rpt=mvx
CPT (Snomed?) -> CVXmappings:  https://www2a.cdc.gov/vaccines/IIS/IISStandards/vaccines.asp?rpt=cpt

### CDCs vaccine program IIS specs

specs on how CDC is storing and representing immunization data in various use cases:
https://www.cdc.gov/vaccines/programs/iis/about.html
https://www.cdc.gov/vaccines/programs/iis/functional-standards/func-stds-v4-1.html
https://www.cdc.gov/vaccines/programs/iis/technical-guidance/downloads/hl7guide-1-5-2014-11.pdf


## Administrative papers

Vaccination proof interop guidelines by the **European Union**:
https://ec.europa.eu/health/sites/health/files/ehealth/docs/vaccination-proof_interoperability-guidelines_en.pdf

Trust framework / interop requirements
https://ec.europa.eu/health/sites/health/files/ehealth/docs/trust-framework_interoperability_certificates_en.pdf

EU Standardised Data set: 
https://ec.europa.eu/health/sites/health/files/preparedness_response/docs/covid-19_rat_common-list_en.pdf

Recovery:
https://ec.europa.eu/health/sites/health/files/ehealth/docs/citizen_recovery-interoperable-certificates_en.pdf

Press Release on EU gateway:
https://ec.europa.eu/commission/presscorner/detail/en/IP_21_2721

Customer facing info site: 
https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en

Digital Green Certificate overview
https://ec.europa.eu/health/ehealth/covid-19_en

European legislation:
https://ec.europa.eu/commission/presscorner/detail/en/ip_21_1181 -> law: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52021PC0130


as discussed by Evernym:
https://www.evernym.com/blog/eu-digital-green-certificate-program/

and debated on TC: https://techcrunch.com/2021/03/17/europes-rush-for-a-covid-19-digital-pass-stirs-concerns/

(WHO) A call for participation
https://www.who.int/news-room/articles-detail/call-for-public-comments-interim-guidance-for-developing-a-smart-vaccination-certificate-release-candidate-1



Qatar open data:
https://www.data.gov.qa/explore/dataset/h4-vaccination/information/

## others / custom / products

Lumedic
https://www.lumedic.io/

Singapore wallet with Open Attestations support
https://github.com/Open-Attestation/identity-wallet

Healthcerts usage at Singapore
1. Further information on HealthCerts: https://go.gov.sg/hc
2. Notαrise: Platform for digital documents to be officiated by the Singapore Government: www.notarise.gov.sg 
3. Open-sourced information on Verify (Platform for authorities to confirm authenticity and legitimacy of digital certificates): https://go.gov.sg/oaverify 
4. For more information on Singapore’s open-sourced e-wallet reference implementation: https://go.gov.sg/oawallet 
5. For more information on Open Attestation: https://go.gov.sg/oa 
6. HealthCerts accredited partners: https://go.gov.sg/hcproviders 
7. To collaborate on HealthCerts: https://go.gov.sg/healthcertscollab 
8. Medium blog articles on HealthCerts (2 part article) https://go.gov.sg/hcblog1 https://go.gov.sg/hcblog2 
9. To view video on HealthCerts: https://go.gov.sg/hcvid https://go.gov.sg/hc 


A ruby impl of health cards (DVCI)
https://github.com/dvci/health_cards


# DID and VC related specs

## DID

https://w3c-ccg.github.io/did-primer/
https://www.w3.org/TR/did-core/#a-simple-example
https://www.w3.org/TR/vc-data-model/#proofs-signatures
https://www.w3.org/TR/vc-data-model/#linked-data-proofs

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

https://verifier.interop.transmute.world/

## Verifiable Credential implementation details

https://www.w3.org/TR/vc-data-model/
https://www.w3.org/TR/vc-imp-guide/

A nonfinal vc http api interface spec
https://github.com/w3c-ccg/vc-http-api


https://w3c-ccg.github.io/vc-extension-registry/#proof-methods

DIF specs
https://github.com/decentralized-identity/claims-credentials

Credential Status Registry
https://w3c-ccg.github.io/vc-csl2017/#introduction

Open Attestation
is a chain based credential storage
https://www.openattestation.com
https://www.openattestation.com/docs/getting-started/

Related to attestations: Open Certs
https://www.opencerts.io/


### Verifiable Presentation Requests

https://w3c-ccg.github.io/vp-request-spec/
needed to request a credential from a holder

https://identity.foundation/presentation-exchange/
https://github.com/decentralized-identity/presentation-exchange
https://w3c-ccg.github.io/vp-request-spec/
needed to request a credential from a holder

https://www.evernym.com/blog/getting-to-practical-interop-with-verifiable-credentials/

## DID Comm

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

# Ethr DID

At the moment (Feb 2021) we're using ethr-did for demonstration reasons. Even though it's not a really recommended way to build self sovereign identities, it allows blockchain anchored DID documents very efficiently and is quite simple to setup, understand, extend and utilize. Real world use cases will likely rely on more advanced did methods (see below for a list of highly promising "in the wild" DID methods)

## Ethr DID related projects

https://github.com/uport-project/ethr-did-registry
https://github.com/decentralized-identity/ethr-did-resolver
https://github.com/decentralized-identity/did-jwt
https://github.com/decentralized-identity/did-jwt-vc

based on Joels work:
https://medium.com/uport/erc1056-erc780-an-open-identity-and-claims-protocol-for-ethereum-aef7207bc744

Lightweight Identity:
https://eips.ethereum.org/EIPS/eip-1056

On Chain Credentials Registry:
https://github.com/ethereum/EIPs/issues/780 (not really recommended)

followed by:

Verifiable Claims on Ethereum:
https://eips.ethereum.org/EIPS/eip-1812

Uport's local ethr did
https://github.com/uport-project/ethr-did

### Eth based registrars

https://github.com/decentralized-identity/ethr-did-resolver/blob/master/doc/did-method-spec.md
https://github.com/gatacaid/gataca-did-method
https://github.com/cryptonicsconsulting/signor-did-contracts/blob/master/did-method-spec.md
https://lianxi-tech.github.io/monid/ (neu)
https://github.com/SelfKeyFoundation/selfkey-did-ledger/blob/develop/DIDMethodSpecs.md

### fork of uport's ethr-did-resolver to support base58 verification keys

https://github.com/decentralized-identity/ethr-did-resolver/pull/106 : the resolver would be able to resolve key material in base58 encoding (instead of base64url) as required by most crypto did libraries at the moment.

# Other DID / SSI (wallet) approaches worth considering

- [Jolocom](https://jolocom.github.io/jolocom-sdk/1.0.0/). Highly involved in the SSI/DID space, drives the INATBA international SSI consortium. Concentrates on DIDComm v2 (open sourced a Rust implementation / JWK, JWM recently). Identities are anchored on  Rinkeby (did:jolo) but they're migrating KERI based microledger DIDs (did:jun)

- [Ceramic / IDX](https://developers.ceramic.network/build/authentication/) is by far the most decentralized and far-though solution for a truly distributed and user controlled identity management. Based on IPFS. In Beta.

- [Sovrin / Evernym](https://sovrin.org/developers/). By far the most advanced and used solution. Runs on a commercial permissioned blockchain. Root anchoring would cost "real" (€) money. Supports sub identities and drives DidComm development. [Evernym Connectme](https://www.evernym.com/products/?#ConnectMe) is a general DID / VC wallet, based on sovrin + mobile wallet sdk

- [lissi.id](https://lissi.id/). A government driven (and financed) wallet based on Hyperledger (?) with a focus on eIDAS compliance (later). Supported by Main.Incubator, TU Berlin, Bundesdruckerei, Deutsche Bahn e.a. Default wallet implementation for the administratively supported [IDUnion](https://idunion.org/?lang=en) initiative.

- [trinsic.id](https://trinsic.id/) implements standards, APIs and tools for Verifiable Credentials. Also based on Hyperledger standards (Aries/DIDComm). Offers Credential services like issuance, revocation and a studio application to design credential schemas. They're making use of sovrin networks and are interoperable with LiSSI.

- Apple Wallet (sic) also fundamentally builds upon VC schematics.

## W3C Universal Wallet

driven by Transmute, lots of React (Material) foundational code and password based locking of content that's wrapped in credentials:

https://w3c-ccg.github.io/universal-wallet-interop-spec/

## Sidetree protocol
anchors CRDT records of DID changes on arbitrary ledgers (or even inline of the did fragment part, see "long form" sidetree DIDs)

https://identity.foundation/sidetree/spec/
https://github.com/decentralized-identity/sidetree

most popular implementation: ION (anchors on Bitcoin, driven by Micro$oft)
https://github.com/decentralized-identity/ion

Transmute has built a more generic (and simpler) implementation that supports :ion (bitcoin), :elem (ethereum), :photon (QLDB) and :trustbloc (fabric) methods: 
https://github.com/transmute-industries/sidetree.js


# loosely related

## Modern signature libraries:

Microsofts approach looks _very_ promising: https://github.com/microsoft/VerifiableCredentials-Crypto-SDK-Typescript

https://github.com/w3c-ccg/lds-jws2020

NaCL DIDs: https://github.com/uport-project/nacl-did
(sig suites: https://github.com/digitalbazaar/vc-js/blob/master/BACKGROUND.md#generating-keys-and-suites)

generic did:key methods Transmute
https://w3c-ccg.github.io/did-method-key/
https://github.com/transmute-industries/did-key.js
https://did.key.transmute.industries/

> Since there is no support for update and deactivate for the did:key method, it is not possible to recover from a security compromise. For this reason, using a did:key for interactions that last weeks to months is strongly discouraged. 

browser based ed25519: noble
https://github.com/paulmillr/noble-ed25519

How JWS signatures are built: http://www.davedoesdev.com/json-web-signatures-on-node-js/

## Digital Bazaars Crypto / LD Suites

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

https://www.ionos.com/digitalguide/websites/website-creation/tutorial-json-ld-with-schemaorg/

Jolocom's lib doku for custom credentials: https://jolocom-lib.readthedocs.io/en/latest/signedCredentials.html#working-with-custom-credentials

### OT: Linting TS

https://khalilstemmler.com/blogs/tooling/prettier/
https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/

# Questions

- are ethr-did-registry key definitions compat to json-ld-signatures?
- do we need the "assumption" types?
- shall we spike IDX / Keri to setup a chain independent controller resolver?
- when do we need universal resolution?

# Todos

- let univax-core only operate on *signer* `({data}) => Uint8Array` interfaces and add private key converters for the different key types accordingly (get rid of Signer)

- test against generic did/vc wallets
- add a verifier for Consensas JSON-LD schemes for an immunization proof
- what's that Segment 4 spec of the CCI working group?
- use a VC revocation registry like ERC780 
- revoke Credentials using their hash (see: are ld proofs part of that hash?? )
- store a remote picture on ipfs that's resolveable by the verifier / part of the credential (or another credential?)
- add BBS+ signature support https://www.npmjs.com/package/@mattrglobal/bbs-signatures

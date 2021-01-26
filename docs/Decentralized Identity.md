# Decentralized Tech Innovation in Health

Any kind of decentralized health data application will at its very foundation have to deal with these topics:

- identity of actors

- authentication

- encryption

- information exchange

- state persistence

- messaging

During our endeavours of the decentralized world we already came along most of them and dealt with them in various, mostly pragmatic ways. Simply put, if you're talking about total "decentralization", you must at least try to be as **interoperable** with world wide standards and as far **decoupled** from federated information silos as possible.

## Identity

Depending on the kind of application you're about to build you can safely assume that you must identify and authenticate users: in its most classic form the identity equals an email address, and authorization can be granted if someone knows a secret password for that email address.

Once someone knows a password for an email address, he can be considered an authorized user, operating in the name of the identity represented by the email address. A nearly equivalent scheme exists on distributed ledgers: Your public Ethereum address can be considered your username (or email address). To prove ownership of that identity to a smart contract (aka a "backend") you present your signature over transaction data as a secret that the backend (the EVM) can check against your address.

Now, identity is so much more than proving control over an account identifier to gain ability to authenticate against a software system. Some say, the true "identity" is a composition of many profiling factors: following that position, your true identity consists not only of your email address and a password but also of your Twitter account, your passport number and your familly photo album. That's what philosophically makes you an identity.

## Authentication

When interacting with software systems in web2.0, we're usually trusting centralized identity providers: we can authenticate against our Google account and receive an **access token** in exchange. We can use this intermediary proof of control to authenticate against 3rd party subsystems, e.g. use it to access our Twitter account without ever leaking the profile information stored in Google. 

So far goes the theory. In reality, due to the intransparent inner workings of Google and Twitter it's absolutely feasible for these companies to combine your actions to a commonly known user **profile**. Another huge tradeoff: once Google cancels your account, you lose control over your Twitter account as well. This kind of identity management is called "**federated login**" and it shines when you need to reduce the attack surface for password breaches but it certainly has huge shortcomings in terms of privacy and self sovereignty of your digital identity. 

## SSI / DID

Hence, some years ago many people started working towards a standard for provable **self sovereign identity** (SSI), leading to the general term "DID": [the decentralized identifier]([A Primer for Decentralized Identifiers](https://w3c-ccg.github.io/did-primer/)). You can think of a DID as a random passport number that cannot directly or immediately be correlated with any private information - it's just a number. The best thing: usually you come up with that number **on your own**. 

Another foundation of SSI is strong cryptography. The whole idea of DIDs is to be resolveable to DID Documents that contain information about the identity's **public keys** so anyone (a "verifier") can ask anyone else (a "prover") to sign some random challenge message and verify it against the publicly resolveable keys inside the DID document.

To fulfill the decentralized promise of DIDs, there are no rules whatsoever about the way DIDs are created or where DID documents are stored. DIDs are an **open W3C standard** and have been officially implemented by at least [60 publicly known parties](https://w3c.github.io/did-spec-registries/#did-methods). Note, that a DID and its document never disclose any information about their user - they don't contain an email address, a name or a passport ID. 

### DID Resolution

To be able to resolve a DID document out of a DID that someone presents to you, you must know about the method he used when creating the DID. A DID therefore contains a **method identifier**. Here's a DID of my ethereum account on my local blockchain:

```
did:ethr:development:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1
```

and you can use the `ethr-did` library to resolve the corresponding DID document:

```js
{
  '@context': 'https://w3id.org/did/v1',
  id: 'did:ethr:development:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  publicKey: [
    {
      id: 'did:ethr:development:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1#controller',
      type: 'Secp256k1VerificationKey2018',
      controller: 'did:ethr:development:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
      ethereumAddress: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'
    }
  ],
  authentication: [
    {
      type: 'Secp256k1SignatureAuthentication2018',
      publicKey: 'did:ethr:development:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1#controller'
    }
  ]
}
```

You might think that this document is anchored on an Ethereum blockchain but trust me, it isn't. Remember: in the Ethereum / blockhain universe it only counts that I'm able to sign something with my private key. A verifier only needs to know my public Ethereum address and can instantly verify (`web3.ecrecover` ) that I'm in control of that key by checking a message that I signed for him. There is no need to store the above document on any chain. It can be generated plainly out of the DID and is actually a common representation of what other DID protocols *might* store on chains or any kind of document system.

#### did:key : the simplest method of them all

If the above example is too Eth-ish for you, lets first start using even more plain cryptographic primitives and generate a [did:key]([The did:key Method v0.7](https://w3c-ccg.github.io/did-method-key/)) compatible DID and resolve it using an official DID resolver library for it:

```javascript
import { Ed25519KeyPair, driver as didKeyDriver } from '@transmute/did-key-ed25519';
import * as crypto from 'crypto';

(async () => {
  const keyPair = await Ed25519KeyPair.generate({
    secureRandom: () => {
      return crypto.randomBytes(32);
    }
  });

  const did = `did:key:${keyPair.fingerprint()}`;
  console.log(did);

  const didDocument = await didKeyDriver.get({ did });
  console.log(didDocument);
})();
```

prints

```javascript
did:key:z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB
{
  '@context': [
    'https://www.w3.org/ns/did/v1',
    {
      '@base': 'did:key:z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB'
    }
  ],
  id: 'did:key:z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB',
  verificationMethod: [
    {
      id: '#z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB',
      type: 'Ed25519VerificationKey2018',
      controller: 'did:key:z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB',
      publicKeyBase58: '9mDyPu4t7okNDNBQYqkBPKnLZcQd1iwTZr7oPaA7PANo'
    },
    {
      id: '#z6LSchxPCcTH585UtW5JEcELmtR6aVd7NVgrVf7M6UVFMEig',
      type: 'X25519KeyAgreementKey2019',
      controller: 'did:key:z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB',
      publicKeyBase58: '22nDgJeQyfMjo7hXhxiPTJCcjM5zftWhcgPfc1qidrwv'
    }
  ],
  authentication: [ '#z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB' ],
  assertionMethod: [ '#z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB' ],
  capabilityInvocation: [ '#z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB' ],
  capabilityDelegation: [ '#z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB' ],
  keyAgreement: [ '#z6LSchxPCcTH585UtW5JEcELmtR6aVd7NVgrVf7M6UVFMEig' ]
}
```

whoa. yes, that's a lot. But it's all derived by the encoded fingerprint of an Ed25519 key pair's public key that we initially generated using a totally random secret **seed** of 32 bytes. When we keep that secret seed, well, secret (aka store it in a wallet that's maybe hardened by a passphrase or a biometric fingerprint), we always can regenerate our private key.

The most significant parts of both resolved DID documents are their `public key`  and `verificationMethod` sections: these tell someone who knows how to resolve the DID document which public keys we're referring to (the key "id") when we present signatures for him, which part of the DID they control and what use case they cover. 

If you only derive a DID from one public key, key and DID are equal but if resolving the DID document would include looking something up on a shared database (blockchains are perfect candidates for that), the public key sections and its controller referrals might become more complex. It's effectively possible that one DID that stands forever can be controlled by totally different public keys of various lengths, ages, strengths or algorithms. 

#### Signing and verifying

Having the private key at hand you can do important things, e.g. sign messages:

```javascript
async function sign(keyPair, message) {
  const signer = keyPair.signer();
  const signature = await signer.sign({ data: message });
  return signature;
}

const signature = await sign(keyPair, 'any kind of message I want to prove');
const b64signature = Buffer.from(signature).toString('base64');
console.log(b64signature);
```

```
wYgpHQLwup1G5wqA9LSrBbIcYjoZAbe0BVYrdqklP6qv0glYHrWsRUSySA+d8P3hTDr5ITnkrzHgSWPRsXvdCw==
```

having only message, signature and DID at hand, you can verify that the signature is valid and therefore the signer must be in control of the private key behind the DID's public key:

```javascript
async function prove(did, message, signature) {
  const didDocument = await didKeyDriver.get({ did });
  const verificationKey = Ed25519KeyPair.from(didDocument.verificationMethod[0]);
  const verifier = verificationKey.verifier();
  return verifier.verify({ data: message, signature });
}
```

```js
prove(
  'did:key:z6MkoDV1z9KKTMEqKs27EQi2ERLLPBgURcBpFs2jDr88JPAB',
  'any kind of message I want to prove',
  Buffer.from(
    'wYgpHQLwup1G5wqA9LSrBbIcYjoZAbe0BVYrdqklP6qv0glYHrWsRUSySA+d8P3hTDr5ITnkrzHgSWPRsXvdCw==',
    'base64'
  )
).then(console.log);
```

```js
true
```

### encoding, capsulation, standards

How did we know which key to use in the above "prove" code? Turns out, we don't. We just guessed, it's the first verification method's key. In the real world, when you'll work with interoperable, method agnostic DIDs you must ensure provers and verifiers are adhering to a commonly negotiated protocol of how keys, signatures, indexes, formats, encodings, key algorithms, etc. are communicated. 

That leads to the overall felt complexity of the DID standard: it must be rather complex so it covers a generic way to express how data between signers, provers and verifiers is exchanged and interpreted. Guess what: that's precisely what the standard does: [Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-core/) .

## Use Cases: authentication & credentials

Now that you know that DIDs can be used to make public keys transparent for verifiers, it's time to talk about the real stuff. What the world currently builds on top of them is called **Verifiable Credentials (VC)** and they get their very own W3C standard: [Verifiable Credentials Data Model 1.0](https://www.w3.org/TR/vc-data-model/) Before you jump over there and get lost in its very own complexity, here's a primer.

### Verifiable Credentials

The whole idea of a credential is to be a self sufficient and contained piece of data that someone (the prover) provides to someone else (a verifier) and that contains a **cryptographic proof** created by some kind of issuer. The issuer actually can be the prover himself - that's what some call a **self signed verifiable credential**. Verifiable Credentials typically contain machine readable data and express a certain **claim** about a subject.

![sasdsad](https://pbs.twimg.com/media/EAp-hnOXsAEeyAf?format=jpg&name=4096x4096)

Here's an example:

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "issuanceDate": "2021-01-25T23:12:52.502Z",
  "credentialSubject": {
    "id": "did:ethr:development:0xffcf8fdee72ac11b5c542428b35eef5769c409f0",
    "immunizationSite": {
      "name": "Berlin Treptow (Arena)",
      "address": "Am Treptower Hafen 1, 10999 Berlin"
    }
  },
  "issuer": "did:ethr:development:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1",
  "type": ["VerifiableCredential"],
  "proof": {
    "type": "EcdsaSecp256k1Signature2019",
    "verificationMethod": "did:ethr:development:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1#controller",
    "created": "2021-01-25T23:12:57.927Z",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJFUzI1NksifQ..zaWr0_TBo8eDgxsnnda6aKyIxotxHmCb-0jZPknFIUvDHCCKIDzAcyGYvfBIUKMV3YX44I-liP9A7Oe6Ne6e2w"
  }
}
```

### A drivers license example

Once you paraphrase all these concepts in a police control short story, it starts to make sense:

The governmental office, as identified by `did: ethr: 0xg0v3rnW3n7` **claims** that the subject identified as `did: key : z6Mk...` has the `license to drive a car`. The office hereby issues a credential to the subject containing that claim in clear text and a cryptographic proof formalized as a signature over the claim's content by government's key pair #37 (controlled by an employee at the desk).

*... police siren whines, car breaks, a cop getting out of his car, "Sir, may I see your license please"...*

The furthermore unknown driver, identified by himself as `did: key: z6Mk` presents a credential that claims in clear text that the subject `did: key: z6Mk` (which is him) has a `license to drive a car` . That claim is signed by some signature issued by someone identfying as `did: ethr: 0xg0v3rnW3n7`. Resolving that DID yielded some public key. Verifying that public key against the presented signature and the claim message yielded `true`.

*... carefully thinking face ... some time flies by ... the plot thickens ...*

"Sir, let me check our official blockchain based smart contract whether `0xg0v3rnW3n7` is registered as a `governmental office`". Here the trust chain stops: at some point the police officer cannot trust a credential on its own but rather must fall back to trust some kind of "root authority". 

The most important **vocabulary** you should take away are:

- **issuer**: an identity who claims anything about another identity 

- **credential**: a combination of clear text, the issuer's signature of that text and some metadata ("this is a credential")

- **subject**: the identity that is been claimed about. Mentioned inside the credential.

- **holder**: someone who has some credential with him.

- **prover**: a holder who's asked to present a credential or prove that he holds keys about a credential or DID

- **verifier**: someone who asks a holder to present a credential and verifies its integrity and makes assumptions about its validness.

- **agent**: some piece of software that allows any other party to technically interact with any other party. Might contain control software about private keys. Can make sense of DIDs. E.g. a smart wallet or SDK.

## Thoughts on privacy, correlation and trust

There are 3 obvious things a verifier must be able to do: 

- resolve DIDs. In the best case, arbitrary DIDs. That can include DIDs that are registered on blockchains like Ethereum or decentralized file systems like IPFS or p2p networks like [Ceramic](https://www.ceramic.network/).

- cryptographically verify proofs inside the credentials against the public keys of the issuer's DID. There are around 6 commonly agreed on key schemes based on elliptic curve cryptography, the most popular ones being [Secp256k1](https://www.npmjs.com/package/secp256k1) and [Ed25519](https://www.npmjs.com/package/elliptic). 

- figure out if the issuer is trusted so the credential can be trusted or continue looking for credentials that makes him trust the issuer.

A highly important **privacy** aspect is, that the verifier doesn't get to know anything about the subject besides the claim it got presented. The only thing the police officer needs to know is, whether the subject holds a claim about him being licensed to drive a car. No need for birth date, gender, issuance date, marriage status, color of skin or full name. 

Now, imagine that the police officer has a notebook and a pencil and stays in the police station the next day. He has a silly habit of putting down all DIDs and claims he's confronted with. When the driver from last night enters his office and tells him that someone broke into his house, presenting a new claim of residence, the police officer suddenly can **correlate** both claims with the same person. That's precisely the counterpart of the web2.0 issue: based on our internet usage Facebook was able to create massive social profiles using our shared cookie data. Verifiers that verify lots of DIDs and claims can take them down to analyse and build profiles of DID holders.

Luckily the DID space has several solutions and one is the **agent concept**: a person uses different identities for different use cases. One identity for health issues, one for his driver license, one for personal data. The DIDs aren't connected with each other but they can stay in one universal wallet that might even use a common seed as foundation for all private keys a user needs to generate new DIDs from (that's the future but we're close). 

> we're ommitting the *really* cool solutions like Zero Knowledge Proofs and Merkle Tree hash anchoring here for brevity. Briefly said, they allow users to prove that they possess certain properties without even showing them to a verifier. ZKP based proofs also allow derivation of statements: when the proof contains my birthdate it's possible to derive a trusted claim about me being over the age of 18 without disclosing the birthdate itself. 

Besides that, a **root issue** exists: as long as the police officer knows the DID of a governmental issuer of driving licenses and it's only that DID that governs driving licenses in his country, the case can be closed: there simply is only one issuer and everybody knows his DID. But what do you do if the government just issues credentials for governmental offices so they can be trusted to issue drivers licenses? In that case a police officer who doesn't know each and every governmental offices' DID must request *someone* if he can provide a credential of the governmental office that has been issued by the government. 

Do you see where that leads to? It's a problem known as the [Web of Trust](https://www.weboftrust.info/index.html). As long as I can follow a signature chain down to some instance I trust, the whole signature chain can be considered trusted. That's actually how your SSL/TLS connections are working: they contain a chain of consecutively signed certificates that lead back to some **root authorities** your browser trusts (click the green lock and follow the "Examine Certificate" button to make it visible!).

 In 2021 we can replace those (rather costly!) root authorities that combine a huge amount of trust and attack surface on them with smart contract based registries which are controlled by a democratic - maybe even economized - consortium of DAO stakeholders. But that might lead a little too far. Just keep in mind: There must be either a commonly agreed on root authority that all credentials can be followed back towards or a verifier must accumulate enough secondary evidence about a subject to make him believe that it's really the entity behind the identity the identity claims to be. 

## Practical, lesser obvious, problem domains: connectivity, communication, presentation requests, key exchange

Here are some things that aren't too obvious in the first place but will give you a hard time once you start writing real life applications based on verifiable credentials:

#### Who's initiating the credential presentation?

A verifier must make sure that the prover right at the moment of proving is in control of the secret keys that are controlling the DID. Hence credentials are usually not simply dispatched to verifiers but rather requested by them. The verifier's [presentation request](https://w3c-ccg.github.io/vp-request-spec/) contains a random challenge / nonce and a semantic description of what the verifier wants to have presented. The prover wraps the plain credentials that seem suitable to the request in a new data format called a **Verifiable Presentation**, adds the provided challenge, signs the new piece of data with his private key and sends it to the verifier. The Verifier now can verifiy that the prover in front of him is in control of the provided keys and go ahead and validate all claims inside the presentation or just the ones he finds suitable for his use case.

#### How do you actually transfer data between the parties?

There's even a standardized [JWT presentation](https://github.com/decentralized-identity/did-jwt) that adds proof signatures **outside** the credential. JWTs can be encoded as QR codes which are readable "over the air" but without any connectivity. What sounds as splendid solution in theory, won't work well in many practical applications: QR code capacity usually is not high enough to contain all credentials a prover wants to present. 

Of course there's a solution, only that it's not mature: [DIDComm](https://identity.foundation/didcomm-messaging/spec/) addresses a lot of these issues and adds a whole new layer of JWE/JWM  sugar on top of it. Peer 2 Peer networks could be of help but it's not guaranteed that verifier and prover find a stable connection between each other even when they stand face to face. Simply put: *it's up to you*. Since everything is signed and can be eventually encrypted, it's even fine to use simple websocket protocol servers (that's actually what DIDComm suggests) and exchange temporarily encrypted messages between all parties

#### What's happening when an issuer figures out that a credential has been issued to the wrong / malicious holder / subject?

Once a signed credential has been issued, it will be proveable to be valid by any verifier. Credentials usually carry an expiration date (If you think about JWT auth bearer tokens in web contexts, they are highly short lived in case they get lost) but that won't help if the issuer needs to explicitly **revoke** a credential as soon as possible. 

W3C suggests the concept of **Credential Registries** that can add status information on top of credentials when they are requested. Quite a secure first take on revoceability are blockchains, again (e.g. as specified in [ERC780](https://github.com/ethereum/EIPs/issues/780) , [ERC1056](https://github.com/ethereum/EIPs/issues/1056) ,  [ERC1812](https://eips.ethereum.org/EIPS/eip-1812)  and the very recent [ERC2844](https://eips.ethereum.org/EIPS/eip-2844) ). An issuer keeps track of all credentials he issues. Once he finds he'd like to revoke one, he takes the keccak hash of the credential and submits that hash to a smart contract based revocation registry using an Ethereum account that will be resolved by verifiers when they resolve the issuer's DID. After checking the local validity of a credential a verifier requests state updates about the keccak hash of the current credential from that smart contract. The contract responds with state updates that can proveably only been issued by the issuer. 

Before you try that: it's not really good since revocations will become insanely expensive. The better idea is to build a merkle tree of all revocations and verify that against a zero knowledge proof under control of the revocation contract. That way the contract can reduce the information needed to check revocation states to a minimum. Ceramic's [IDX protocol](https://idx.xyz/) more or less works towards that direction and it looks really promising.

#### What's happening when I lose my keys?

Then you lost all your money, silly. The idea of social key recovery is one of the main USPs of [uPort's smart wallet](https://medium.com/uport/making-uport-smart-contracts-smarter-part-2-introducing-identitymanager-af656ba7441b). Jolocom is using a brand new key presentation and rotation scheme called [KERI](https://jolocom.io/blog/how-keri-tackles-the-problem-of-trust/) that's capable of rotating keys without the need of ledger based registries. DID methods that rely on any kind of registry (especially chain based solutions, eg. ethr-did, btc, evan or sovrin) allow to add secondary and delegate keys to your main public key set. If you created a second keypair for your DID you can start using that as a primary one. 

But honestly: don't store keys, store seeds! Wrap seeds as mnemonic that you put in a really safe place. Use signature cards with secure elements. Smartphones with Fingerprint sensors. But please: don't lose your private keys!

# Using W3C DIDs / VCs for immunization proofs

Already in mid 2020 many people anticipated the need for a kind of generally acceptable **immunization proof for covid-19**, or to put it more concise to approach the following use cases:

- As a "user" I want to store credentials about my covid-19 immunity in a personal wallet

- As a "gate" I want to prove the user's immunization credentials

- As a "provider" I want to issue credentials about a user's immunity to the user

- Given that not the CDC itself issues all immunization credentials, a "provider" also needs to be certified somehow. That implies there's might a need for some kind of provable credential chain that starts at a "root" authority (the "CDC", "BMG", "health governance") and trickles down via "immunization sites", "practitioner offices" or "testing facilities" down to the "providers" who finally verify claims about the user they treated or found out about.

- We shouldn't assume that everybody relies on a restricted set of anchoring technology. Hence we should at least try to support the most common DID agents 
  
  - Sovrin/Evernym connect.me,
  
  - Jolocom (KERI)
  
  - lissi.id
  
  - did-ethr/uport
  
  - trinsic
  
  - IDX/Ceramic
  
  - Sidetree/Ion

- credential chain lookup is a very special issue. From here I can say that we *could* rely on a credential registry that makes credentials resolveable by their DIDs. E.g. we could store all credentials about an user using IPFS and keep them pinned upon issuance. That's a cornerstone of the IDX idea, by the way.

- The much nicer solution might be to provide the whole credential trust chain to the user. A verifier can create a kind of "combined presentation request" that queries for credentials that might depend on each other, e.g. a "proof of non-infectiousness" that can be resolved by agents by presenting either a signed "immunization" or "test result" credential

- Credentials must **expire**, depending on their use case. Given the case that some provider only vaccinates for 1 day he must only be allowed to issue immunization credentials at that given day. The verifier must ensure that the immunization credential has been provided by an issuer who was allowed to do so, right at that time. That's where blockchain timestamping might come in handy.

- Credential Semantics. Believe it or not, but there is **no** agreed on format how to formulate an immunization credential. Seen in the wild are
  
  - FHIR bundles (contain Immunization or Medication & Patient & Provider docs which discloses *a lot* of information), used by Cisco / Microsoft / Oracle / Salesforce in their [Smart Health Card initiative ](https://smarthealth.cards/)(anchoring on [Sidetree](https://identity.foundation/sidetree/spec/)). Seems to be related to the [VCI initiative](https://vaccinationcredential.org/news).
  
  - The CDC provides its very own [document format](https://www.cdc.gov/coronavirus/2019-ncov/vaccines/safety/vsafe.html)  issued by US testing labs
  
  - [Other projects](https://passport.consensas.com/) went with the highly acclaimed but truly complex idea of creating new schema.org Schemas for patients, clinics, providers atc. [Claims can be assembled using JSON-LD](https://www.w3.org/TR/vc-data-model/#json-ld) along these schemas and automatically conform to the JSON-LD VC standard. Since none of these schemas is formally accepted by schema.org and implementers also don't go the long way to canonicalize the proposed schemas formats, this might be a hard path to follow.
  
  - To be honest, the most promising approach seems to arise from [Linux Foundation's CCI (Covid-19 Credentials Initiative) working group](https://www.covidcreds.org/) . It takes great care of identifying the major formats and tries to talk to adminstration facilities (e.g. the US Ministry of Health & CDC)
  
  - Ubirch has released a totally unique, zero knowledge proof based, chain agnostic anchoring technology that puts hashed credentials (non W3C atm) onto Eth and IOTA and announces it as a [Corona Certificate](https://corona-certificate.com/). Verifiers can check the clear text claim at a gate and verifon chain whether the claim has been known before. That still imposes the issue that you must have some root authority responsible for the anchors that verifiers trust.

- Semantic credential / presentation checks. After all it's up to the verifier to figure out if the presented set of credentials makes him believe that the user's "I'm not infectious" claim holds. Due to the nature of the aforementioned agreement shortcomings he might be confronted with various credentials using dedicated semantics, versions and proof mechanisms that he must try to align towards a trustful chain of evidence.

## Conclusion

It's **highly** unlikely that the world will be able to come up with an unified "proof of immunization". DIDs and VCs are the ideal technology to present and prove an immunization claim, though, and many parties are individually working towards a common goal.

We'll try to concentrate on the lower hanging fruits: the **verifier side**. We try to figure out which approaches are used in the wild, and as long as they're using a mostly distributed, documented specification that roughly follows the W3C DID/VC specs we try to integrate their credentials and did methods into our verifier solution.

We also try to be interoperable to as many user agents ("wallets") that conform to W3C standards and try to use standards for data exchange and communication (DIDComm) where possible.

Hence our goal is to build a **universal verifier** application for immunization credentials that can be operated by any gate keeper who doesn't need to trust anything besides some root authorities to prove the validity of any presented credential. 

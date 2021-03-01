# @univax/core

contains features for creating, issuing, parsing, validating and verifying [verifiable credentials](https://www.w3.org/TR/vc-data-model/) on a low level. On a high level it tries to make validating immunization credentials as straight forward as possible using the `VaccinationCredentialVerifier` class. 

We'll change the resolver's interface soon to enable usage of a [DIF Universal Resolver](https://github.com/decentralized-identity/universal-resolver). For now it tries to wrap [ethr-did](https://github.com/uport-project/ethr-did) in the most simple way. The only requirement to resolve ethr-DIDs on any ethereum chain is an [Infura ID](https://infura.io/) (needs registration) but you can also deploy your own [ethr-did-registry](https://github.com/uport-project/ethr-did-registry) on a local chain and add it to the resolver config (wrapped contracts are part of this package, see the `contracts` folder). 

We also added support for [Sidetree Element](https://github.com/decentralized-identity/element/blob/master/docs/did-method-spec/spec.md) DIDs in [another package](). You can easily enable `did:elem` resolution by adding a configured resolver as a custom resolver registry to core's `ResolverBuilder`. Unfortunately it'll turn out *really* cumbersome to resolve all DIDs inside one browser window, hence we're offering an `addRemoteFallbackResolver(url: string)` method: it'll POST `url` with a request body of `{did:'did'}` so you can have a highly connected resolver backend do the heavy lifting for you.

This library is agnostic to the way how credentials are actually *presented* to the verifier. Real world scenarios will make use of rather complex flows including DIDComm, ECDH keys, transport encryption, vc registries, revocation lookups and so on. That's out of scope of *this* library. Its purpose is to verify the credential content and prove the credential signature (and potentially resolve credentials chains using service hub did entries). Have a look at our [root repo](https://github.com/elmariachi111/ultimate-non-infectious-verifier) to get an idea of the flows involved.

The `VaccinationCredentialVerifier` makes use of an aforementioned, configured `Resolveable` instance to lookup issuer's DIDs. At the moment it recognizes credentials of the formats:

- `https://smarthealth.cards#covid19`
- `https://schema.org#ImmunizationRecord`

The credentials can be presented either as JWT or JSON-LD / JWS signed. We support signature proving with EcDSA256k and EdDSA25519 at the moment. 


## demo code

see working code in the `examples` folder.

```javascript
const { ResolverBuilder, VaccinationCredentialVerifier, Verifier } = require('@univax/core');

//get your infura id here: https://infura.io/
const providerConfig = ResolverBuilder.ethProviderConfig(process.env.INFURA_ID);

const resolver = ResolverBuilder()
    .addKeyResolver()
    .addEthResolver(providerConfig)
    .build();

const verifier = new Verifier(resolver);

const univax = new VaccinationCredentialVerifier(resolver);
univax.initialize();

async function main() {

    //check that we can resolve simple ethr:did DIDs
    const res = await resolver.resolve("did:ethr:goerli:0x22d491bde2303f2f43325b2108d26f1eaba1e32b");
    console.log("resolved did", res);

    //see examples folder
    const credentials = [
        "eyJ0eXA...",
        "eyJ0eXA..." 
    ]

    //this will plainly check the credentials' cryptographic validity
    for await (const verified of credentials.map(vc => verifier.verifyCredential(vc))) {
        console.log(JSON.stringify(verified, null,2));
    }
    
    //this will check the credentials' content and semantics as well
    const verification = await univax.verify(credentials);
    console.log(verification);
}

main();
``` 

yields 

the resolved DID
```javascript
{
  '@context': 'https://w3id.org/did/v1',
  id: 'did:ethr:goerli:0x22d491bde2303f2f43325b2108d26f1eaba1e32b',
  publicKey: [
    {
      id: 'did:ethr:goerli:0x22d491bde2303f2f43325b2108d26f1eaba1e32b#controller',
      type: 'Secp256k1VerificationKey2018',
      controller: 'did:ethr:goerli:0x22d491bde2303f2f43325b2108d26f1eaba1e32b',
      ethereumAddress: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b'
    }
  ],
  authentication: [
    {
      type: 'Secp256k1SignatureAuthentication2018',
      publicKey: 'did:ethr:goerli:0x22d491bde2303f2f43325b2108d26f1eaba1e32b#controller'
    }
  ]
}
``` 
the first verified credential

```javascript
{
  "credentialSubject": {
    "fhirVersion": "4.0.1",
    "fhirResource": {
      "resource": {
        "resourceType": "Immunization",
        "status": "completed",
        "meta": {
          "profile": [
            "http://hl7.org/fhir/us/vaccinecredential/StructureDefinition/vaccine-credential-immunization"
          ]
        },
        "vaccineCode": {
          "coding": [
            {
              "code": "207",
              "display": "COVID-19, mRNA, LNP-S, PF, 10 mcg/0.1 mL dose",
              "system": "http://hl7.org/fhir/sid/cvx"
            }
          ]
        },
        "occurrenceDateTime": "2021-02-08T22:46:53.792Z",
        "primarySource": true,
        "lotNumber": "ABCDE",
        "protocolApplied": [
          {
            "targetDisease": [
              {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "840539006",
                    "display": "COVID-19"
                  }
                ]
              }
            ],
            "doseNumberPositiveInt": 1,
            "seriesDosesPositiveInt": 2
          }
        ],
        "doseQuantity": {
          "system": "http://unitsofmeasure.org",
          "value": 10,
          "code": "ml"
        }
      }
    },
    "id": "did:ethr:0x3ed0e9ca5994dcd4b5a513136e8a693573719d71"
  },
  "issuer": {
    "id": "did:ethr:0x5fc3680e1e11a14bf016cdff86dd38634321d873"
  },
  "type": [
    "VerifiableCredential",
    "https://smarthealth.cards#covid19"
  ],
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "issuanceDate": "2021-02-08T22:47:05.000Z",
  "proof": {
    "type": "JwtProof2020",
    "jwt": "see.jwt.above"
  }
}
``` 

the second verified credential

```javascript
{
  "credentialSubject": {
    "@context": {
      "schema:": "https://schema.org",
      "security": "https://w3id.org/security#"
    },
    "@type": "ImmunizationRecord",
    "name": "COVID-19 Immunization",
    "patient": {},
    "location": {},
    "primaryPrevention": {
      "@type": "ImmunizationRecommendation",
      "drug": {
        "@type": "Drug",
        "name": "",
        "code": {
          "@type": "MedicalCode",
          "codingSystem": "CDC-MVX.CVX",
          "codeValue": "MVX-MOD.CVX-207"
        },
        "manufacturer": {
          "@type": "Organization-CDC-MVX",
          "identifier": "MVX-MOD",
          "name": "Moderna US, Inc."
        }
      },
      "healthCondition": {
        "@type": "MedicalCondition",
        "code": {
          "@type": "MedicalCode",
          "codeValue": "U07",
          "codingSystem": "ICD-10"
        }
      }
    },
    "doseSequence": 2,
    "lotNumber": "ABCDEF",
    "immunizationDate": "2021-02-20T23:12:55.691Z",
    "id": "did:ethr:goerli:0x3ed0e9ca5994dcd4b5a513136e8a693573719d71"
  },
  "issuer": {
    "id": "did:ethr:goerli:0x5fc3680e1e11a14bf016cdff86dd38634321d873"
  },
  "type": [
    "VerifiableCredential",
    "https://schema.org#ImmunizationRecord"
  ],
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "issuanceDate": "2021-02-20T23:13:08.000Z",
  "proof": {
    "type": "JwtProof2020",
    "jwt": "...see.2nd-jwt.above"
  }
}
```

and the unspectacular immunization credential verification result:

```text
the immunization dates are too close (12.002126099537037)
true
``` 

(we haven't added a check for the immunization interval yet but print it to console.err)


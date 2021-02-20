# @univax/core

contains a lot of features for creating, issuing, parsing, validating and verifying [verifiable credentials](https://www.w3.org/TR/vc-data-model/) on a low level. On a high level it tries to make validating immunization credentials as straight forward as possible using the `VaccinationCredentialVerifier` class. 

We'll change the resolver's interface soon to enable usage of a [DIF Universal Resolver](https://github.com/decentralized-identity/universal-resolver). For now it tries to wrap [ethr-did](https://github.com/uport-project/ethr-did) in the most simple way. The only requirement to resolve ethr-DIDs on any ethereum chain is an [Infura ID](https://infura.io/) (needs registration) but you can also deploy your own [ethr-did-registry](https://github.com/uport-project/ethr-did-registry) on a local chain and add it to the resolver config (wrapped contracts are part of this package, see the `contracts` folder). 

This library is agnostic to the way how credentials are *presented* to the verifier. Real world scenarios will make use of rather complex flows inlcuding DIDComm, ECDH keys, transport encryption, vc registries, revocation lookups and so on. That's out of scope of *this* library. Its purpose is to verify the credential content and prove the credential signature (and potentially resolve ancestor credentials using service hub did entries). Have a look at our [root repo](https://github.com/elmariachi111/ultimate-non-infectious-verifier) to get an idea of the flows involved.

Therefore `VaccinationCredentialVerifier` is supposed to be used with the presented credentials. Currently it can resolve credentials issued by `did:key` or `did:ethr:xxx` DIDs and recognizes the formats 

- `https://smarthealth.cards#covid19`
- `https://schema.org#ImmunizationRecord`

The credentials can be presented either as JWT or JSON-LD / JWS signed. We support signature proving with EcDSA256k and EdDSA25519 at the moment. 


## demo code

(you can check the credential JWTs' content using a tool like jwt.io):

```javascript
const { Resolver, VaccinationCredentialVerifier, Verifier } = require('@univax/core');

//get your infura id here: https://infura.io/
const providerConfig = Resolver.ethProviderConfig(process.env.INFURA_ID);

const resolver = new Resolver([
    ...providerConfig,
    //this is only needed when you want to test with a local ethereum chain
    //needs a ethr-did-registry setup
    {
        name: 'development',
        rpcUrl: 'http://127.0.0.1:7545',
        registry: '0x9ce4cd6D7f5e8b14c7a3e8e6A257A86Bd5a6EeA0'
    }
]);

const verifier = new Verifier(resolver);

const univax = new VaccinationCredentialVerifier(resolver);
univax.initialize();

async function main() {

    //check that we can resolve simple ethr:did DIDs
    const res = await resolver.resolve("did:ethr:goerli:0x22d491bde2303f2f43325b2108d26f1eaba1e32b");
    console.log(res);

    //note that both credentials are expressed in different formats
    //both are expressing an immunization with a Moderna Vaccine of the same subject (patient)
    //debug these on jwt.io
    const credentials = [
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJmaGlyVmVyc2lvbiI6IjQuMC4xIiwiZmhpclJlc291cmNlIjp7InJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IkltbXVuaXphdGlvbiIsInN0YXR1cyI6ImNvbXBsZXRlZCIsIm1ldGEiOnsicHJvZmlsZSI6WyJodHRwOi8vaGw3Lm9yZy9maGlyL3VzL3ZhY2NpbmVjcmVkZW50aWFsL1N0cnVjdHVyZURlZmluaXRpb24vdmFjY2luZS1jcmVkZW50aWFsLWltbXVuaXphdGlvbiJdfSwidmFjY2luZUNvZGUiOnsiY29kaW5nIjpbeyJjb2RlIjoiMjA3IiwiZGlzcGxheSI6IkNPVklELTE5LCBtUk5BLCBMTlAtUywgUEYsIDEwIG1jZy8wLjEgbUwgZG9zZSIsInN5c3RlbSI6Imh0dHA6Ly9obDcub3JnL2ZoaXIvc2lkL2N2eCJ9XX0sIm9jY3VycmVuY2VEYXRlVGltZSI6IjIwMjEtMDItMDhUMjI6NDY6NTMuNzkyWiIsInByaW1hcnlTb3VyY2UiOnRydWUsImxvdE51bWJlciI6IkFCQ0RFIiwicHJvdG9jb2xBcHBsaWVkIjpbeyJ0YXJnZXREaXNlYXNlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6Imh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiLCJjb2RlIjoiODQwNTM5MDA2IiwiZGlzcGxheSI6IkNPVklELTE5In1dfV0sImRvc2VOdW1iZXJQb3NpdGl2ZUludCI6MSwic2VyaWVzRG9zZXNQb3NpdGl2ZUludCI6Mn1dLCJkb3NlUXVhbnRpdHkiOnsic3lzdGVtIjoiaHR0cDovL3VuaXRzb2ZtZWFzdXJlLm9yZyIsInZhbHVlIjoxMCwiY29kZSI6Im1sIn19fX0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJodHRwczovL3NtYXJ0aGVhbHRoLmNhcmRzI2NvdmlkMTkiXX0sInN1YiI6ImRpZDpldGhyOjB4M2VkMGU5Y2E1OTk0ZGNkNGI1YTUxMzEzNmU4YTY5MzU3MzcxOWQ3MSIsIm5iZiI6MTYxMjgyNDQyNSwiaXNzIjoiZGlkOmV0aHI6MHg1ZmMzNjgwZTFlMTFhMTRiZjAxNmNkZmY4NmRkMzg2MzQzMjFkODczIn0.Zu9RaURnBAde5eaUyxuLFqSAL9PAT8YCT3a4O7Vue4CFv91OtvBfRz9MaEUGEsj_DvX7RQEVNGGr66mc1n-RLA",
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJAY29udGV4dCI6eyJzY2hlbWE6IjoiaHR0cHM6Ly9zY2hlbWEub3JnIiwic2VjdXJpdHkiOiJodHRwczovL3czaWQub3JnL3NlY3VyaXR5IyJ9LCJAdHlwZSI6IkltbXVuaXphdGlvblJlY29yZCIsIm5hbWUiOiJDT1ZJRC0xOSBJbW11bml6YXRpb24iLCJwYXRpZW50Ijp7fSwibG9jYXRpb24iOnt9LCJwcmltYXJ5UHJldmVudGlvbiI6eyJAdHlwZSI6IkltbXVuaXphdGlvblJlY29tbWVuZGF0aW9uIiwiZHJ1ZyI6eyJAdHlwZSI6IkRydWciLCJuYW1lIjoiIiwiY29kZSI6eyJAdHlwZSI6Ik1lZGljYWxDb2RlIiwiY29kaW5nU3lzdGVtIjoiQ0RDLU1WWC5DVlgiLCJjb2RlVmFsdWUiOiJNVlgtTU9ELkNWWC0yMDcifSwibWFudWZhY3R1cmVyIjp7IkB0eXBlIjoiT3JnYW5pemF0aW9uLUNEQy1NVlgiLCJpZGVudGlmaWVyIjoiTVZYLU1PRCIsIm5hbWUiOiJNb2Rlcm5hIFVTLCBJbmMuIn19LCJoZWFsdGhDb25kaXRpb24iOnsiQHR5cGUiOiJNZWRpY2FsQ29uZGl0aW9uIiwiY29kZSI6eyJAdHlwZSI6Ik1lZGljYWxDb2RlIiwiY29kZVZhbHVlIjoiVTA3IiwiY29kaW5nU3lzdGVtIjoiSUNELTEwIn19fSwiZG9zZVNlcXVlbmNlIjoyLCJsb3ROdW1iZXIiOiJBQkNERUYiLCJpbW11bml6YXRpb25EYXRlIjoiMjAyMS0wMi0yMFQyMzoxMjo1NS42OTFaIn0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJodHRwczovL3NjaGVtYS5vcmcjSW1tdW5pemF0aW9uUmVjb3JkIl19LCJzdWIiOiJkaWQ6ZXRocjpnb2VybGk6MHgzZWQwZTljYTU5OTRkY2Q0YjVhNTEzMTM2ZThhNjkzNTczNzE5ZDcxIiwibmJmIjoxNjEzODYyNzg4LCJpc3MiOiJkaWQ6ZXRocjpnb2VybGk6MHg1ZmMzNjgwZTFlMTFhMTRiZjAxNmNkZmY4NmRkMzg2MzQzMjFkODczIn0.O0-WcGRAAqHZXDlg3x5YbzYBawgCkLkazM7zXfrwU1_Wly8oL7Q0U4NvpYWCNGxRZOMIQEwjeGvcWegzHMMCzA" 
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


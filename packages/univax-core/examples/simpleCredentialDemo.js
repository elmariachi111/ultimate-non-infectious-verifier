//start this as INFURA_ID=1234 node exmaples/simpleCredentialDemo.js
const { ResolverBuilder, VaccinationCredentialVerifier, Verifier } = require('../build');

//use a preconfigured set of did:ethr resolvers
//get your infura id here: https://infura.io/
const providerConfig = ResolverBuilder.ethProviderConfig(process.env.INFURA_ID);

// alternatively / additionally you can add a local ethereum network
// needs a registry address (contracts are part of this repo)
// providerConfig.push(
// [
//     {
//         name: 'development',
//         rpcUrl: 'http://127.0.0.1:7545',
//         registry: '0x9ce4cd6D7f5e8b14c7a3e8e6A257A86Bd5a6EeA0'
//     }
// ]);

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

    //note that both credentials are expressed in different formats
    //both are expressing an immunization with a Moderna Vaccine of the same subject (patient)
    //(you can check the credential JWTs' content using a tool like jwt.io):
    const credentials = [
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJmaGlyVmVyc2lvbiI6IjQuMC4xIiwiZmhpclJlc291cmNlIjp7InJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IkltbXVuaXphdGlvbiIsInN0YXR1cyI6ImNvbXBsZXRlZCIsIm1ldGEiOnsicHJvZmlsZSI6WyJodHRwOi8vaGw3Lm9yZy9maGlyL3VzL3ZhY2NpbmVjcmVkZW50aWFsL1N0cnVjdHVyZURlZmluaXRpb24vdmFjY2luZS1jcmVkZW50aWFsLWltbXVuaXphdGlvbiJdfSwidmFjY2luZUNvZGUiOnsiY29kaW5nIjpbeyJjb2RlIjoiMjA3IiwiZGlzcGxheSI6IkNPVklELTE5LCBtUk5BLCBMTlAtUywgUEYsIDEwIG1jZy8wLjEgbUwgZG9zZSIsInN5c3RlbSI6Imh0dHA6Ly9obDcub3JnL2ZoaXIvc2lkL2N2eCJ9XX0sIm9jY3VycmVuY2VEYXRlVGltZSI6IjIwMjEtMDItMDhUMjI6NDY6NTMuNzkyWiIsInByaW1hcnlTb3VyY2UiOnRydWUsImxvdE51bWJlciI6IkFCQ0RFIiwicHJvdG9jb2xBcHBsaWVkIjpbeyJ0YXJnZXREaXNlYXNlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6Imh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiLCJjb2RlIjoiODQwNTM5MDA2IiwiZGlzcGxheSI6IkNPVklELTE5In1dfV0sImRvc2VOdW1iZXJQb3NpdGl2ZUludCI6MSwic2VyaWVzRG9zZXNQb3NpdGl2ZUludCI6Mn1dLCJkb3NlUXVhbnRpdHkiOnsic3lzdGVtIjoiaHR0cDovL3VuaXRzb2ZtZWFzdXJlLm9yZyIsInZhbHVlIjoxMCwiY29kZSI6Im1sIn19fX0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJodHRwczovL3NtYXJ0aGVhbHRoLmNhcmRzI2NvdmlkMTkiXX0sInN1YiI6ImRpZDpldGhyOjB4M2VkMGU5Y2E1OTk0ZGNkNGI1YTUxMzEzNmU4YTY5MzU3MzcxOWQ3MSIsIm5iZiI6MTYxMjgyNDQyNSwiaXNzIjoiZGlkOmV0aHI6MHg1ZmMzNjgwZTFlMTFhMTRiZjAxNmNkZmY4NmRkMzg2MzQzMjFkODczIn0.Zu9RaURnBAde5eaUyxuLFqSAL9PAT8YCT3a4O7Vue4CFv91OtvBfRz9MaEUGEsj_DvX7RQEVNGGr66mc1n-RLA",
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJ2YyI6eyJjcmVkZW50aWFsU3ViamVjdCI6eyJAY29udGV4dCI6eyJzY2hlbWE6IjoiaHR0cHM6Ly9zY2hlbWEub3JnIiwic2VjdXJpdHkiOiJodHRwczovL3czaWQub3JnL3NlY3VyaXR5IyJ9LCJAdHlwZSI6IkltbXVuaXphdGlvblJlY29yZCIsIm5hbWUiOiJDT1ZJRC0xOSBJbW11bml6YXRpb24iLCJwYXRpZW50Ijp7fSwibG9jYXRpb24iOnt9LCJwcmltYXJ5UHJldmVudGlvbiI6eyJAdHlwZSI6IkltbXVuaXphdGlvblJlY29tbWVuZGF0aW9uIiwiZHJ1ZyI6eyJAdHlwZSI6IkRydWciLCJuYW1lIjoiIiwiY29kZSI6eyJAdHlwZSI6Ik1lZGljYWxDb2RlIiwiY29kaW5nU3lzdGVtIjoiQ0RDLU1WWC5DVlgiLCJjb2RlVmFsdWUiOiJNVlgtTU9ELkNWWC0yMDcifSwibWFudWZhY3R1cmVyIjp7IkB0eXBlIjoiT3JnYW5pemF0aW9uLUNEQy1NVlgiLCJpZGVudGlmaWVyIjoiTVZYLU1PRCIsIm5hbWUiOiJNb2Rlcm5hIFVTLCBJbmMuIn19LCJoZWFsdGhDb25kaXRpb24iOnsiQHR5cGUiOiJNZWRpY2FsQ29uZGl0aW9uIiwiY29kZSI6eyJAdHlwZSI6Ik1lZGljYWxDb2RlIiwiY29kZVZhbHVlIjoiVTA3IiwiY29kaW5nU3lzdGVtIjoiSUNELTEwIn19fSwiZG9zZVNlcXVlbmNlIjoyLCJsb3ROdW1iZXIiOiJBQkNERUYiLCJpbW11bml6YXRpb25EYXRlIjoiMjAyMS0wMi0yMFQyMzoxMjo1NS42OTFaIn0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJodHRwczovL3NjaGVtYS5vcmcjSW1tdW5pemF0aW9uUmVjb3JkIl19LCJzdWIiOiJkaWQ6ZXRocjpnb2VybGk6MHgzZWQwZTljYTU5OTRkY2Q0YjVhNTEzMTM2ZThhNjkzNTczNzE5ZDcxIiwibmJmIjoxNjEzODYyNzg4LCJpc3MiOiJkaWQ6ZXRocjpnb2VybGk6MHg1ZmMzNjgwZTFlMTFhMTRiZjAxNmNkZmY4NmRkMzg2MzQzMjFkODczIn0.O0-WcGRAAqHZXDlg3x5YbzYBawgCkLkazM7zXfrwU1_Wly8oL7Q0U4NvpYWCNGxRZOMIQEwjeGvcWegzHMMCzA"
    ]

    //this will plainly check the credentials' cryptographic validity
    for await (const verified of credentials.map(vc => verifier.verifyCredential(vc))) {
        console.log("credential", JSON.stringify(verified, null, 2));
    }

    //this will check the credentials' content and semantics as well
    const verification = await univax.verify(credentials);
    console.log("Verification Result", verification);
}

main();
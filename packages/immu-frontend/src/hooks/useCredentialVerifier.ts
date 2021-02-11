import { useIdentity } from "../context/IdentityContext";
import { VaccinationCredentialVerifier, makeCredentialVerifier } from '@immu/core';

const useCredentialVerifier = () : {
    credentialVerifier: VaccinationCredentialVerifier
} =>  {

    const { resolver } = useIdentity();
    
    const credentialVerifier = makeCredentialVerifier(resolver);

    return { credentialVerifier };
} 

export default useCredentialVerifier;
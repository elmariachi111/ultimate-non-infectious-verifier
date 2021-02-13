import { useIdentity } from "../context/IdentityContext";
import { VaccinationCredentialVerifier } from '@immu/core';

const useCredentialVerifier = () : {
    credentialVerifier: VaccinationCredentialVerifier
} =>  {

    const { resolver } = useIdentity();
    
    const credentialVerifier = new VaccinationCredentialVerifier(resolver);
    credentialVerifier.initialize();
    return { credentialVerifier };
} 

export default useCredentialVerifier;
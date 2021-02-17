import { FHIRBundle } from '../@types/Fhir';
import { CovidImmunization, ImmunizationTemplateParams, decodeDrugCode } from './Covid19';
import ICheckCredentials from './ICheckCredentials';
import Template from './templates/hl7_immunization';

export const TYPE = 'https://smarthealth.cards#covid19';

export class FhirHL7VaccinationCredential extends ICheckCredentials {
  protected normalize(claim: Record<string, any>): CovidImmunization | undefined {
    const { fhirResource } = claim;
    if (!fhirResource) {
      throw Error("credential doesn't contain a FHIR resource");
    }

    const { resource } = fhirResource;
    if (resource.resourceType !== 'Immunization') return; //skip this one.

    const { coding } = resource.vaccineCode;
    const vaccination = decodeDrugCode(coding[0].system, coding[0].code);

    if (!vaccination) {
      throw new Error('couldnt decode the provided immunization code');
    }

    const immunization: CovidImmunization = {
      doseSequence: resource.protocolApplied?.doseNumberPositiveInt || 0,
      lotNumber: resource.lotNumber || '',
      occurrenceDateTime: new Date(resource.occurrenceDateTime),
      cvxCode: vaccination.cvxCode,
      cvx: vaccination
    };

    return immunization;
  }
}

export const Create = (params: CovidImmunization): FHIRBundle => {
  const templateParams: ImmunizationTemplateParams = {
    ...params,
    drug: {
      code: {
        description: params.cvx?.shortDescription,
        codeValue: params.cvxCode,
        codingSystem: 'http://hl7.org/fhir/sid/cvx'
      }
    }
  };

  const docString = Template(templateParams);

  return {
    fhirVersion: '4.0.1',
    fhirResource: JSON.parse(docString)
  };
};

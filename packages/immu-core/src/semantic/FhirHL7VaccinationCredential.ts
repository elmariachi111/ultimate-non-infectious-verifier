import ICheckCredentials from './ICheckCredentials';
import { FHIRBundle, ImmunizationInputParams } from '../@types/Fhir';
import Template from './templates/hl7_immunization';

export const TYPE = 'https://smarthealth.cards#covid19';

export class FhirHL7VaccinationCredential extends ICheckCredentials {
  protected normalize(claim: Record<string, any>): ImmunizationInputParams | undefined {
    const normalized: Record<string, any> = {};
    const { fhirResource } = claim;
    if (!fhirResource) {
      throw Error("credential doesn't contain a FHIR resource");
    }

    const { resource } = fhirResource;
    if (resource.resourceType !== 'Immunization') return; //skip this one.

    const { coding } = resource.vaccineCode;

    normalized.drug = {
      code: {
        codeValue: coding[0].code,
        codingSystem: coding[0].system
      }
    };
    normalized.doseSequence = resource.protocolApplied?.doseNumberPositiveInt || 0;
    normalized.lotNumber = resource.lotNumber || '';
    normalized.occurrenceDateTime = new Date(resource.occurrenceDateTime);

    return normalized as ImmunizationInputParams;
  }
}

export const Create = (params: ImmunizationInputParams): FHIRBundle => {
  const qty = params.doseQuantity;
  //todo: this must be corrected and depends on the vaccine code ;)
  params.description = `COVID-19, mRNA, LNP-S, PF, ${qty} mcg/${(qty / 100).toFixed(1)} mL dose`;

  const docString = Template(params);

  return {
    fhirVersion: '4.0.1',
    fhirResource: JSON.parse(docString)
  };
};

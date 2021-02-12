import { FHIRImmunizationInputParams, FHIRResource } from '../@types/Fhir';
import ICheckCredentials from './ICheckCredentials';
import fhirTemplate from './templates/hl7_immunization.json';

export const TYPE = 'https://smarthealth.cards#covid19';

export class FhirHL7VaccinationCredential extends ICheckCredentials {
  protected checkForSchematicCorrectness(claim: Record<string, any>): void {
    if (!claim.fhirResource) {
      throw Error("credential doesn't contain a FHIR resource");
    }
  }

  protected checkForContentCorrectness(claim: Record<string, any>): void {
    const { fhirResource } = claim;

    const { resource } = fhirResource;

    //todo: check the resource content | FHIR related
    if (resource.resourceType !== 'Immunization') return; //skip this one.

    const { coding } = resource.vaccineCode;
    const sidCvxCode = coding.filter((coding: any) => coding.system === 'http://hl7.org/fhir/sid/cvx');
    if (!sidCvxCode) {
      throw Error('we cannot recognize the immunization coding system');
    }

    const vaccCode = sidCvxCode[0].code;
    if (!['207', '208'].includes(vaccCode)) {
      throw Error(`we don't recognize the vaccination code you received (${vaccCode})`);
    }
  }

  public checkClaimCombination(claims: Record<string, any>[]): void {
    if (claims.length !== 2) {
      throw Error('you must present exactly 2 resources');
    }

    const fhirResources = claims.map((claim) => claim.fhirResource);
    const occurrenceTimes = fhirResources.map((fh) => new Date(fh.resource.occurrenceDateTime).getTime());
    const msDiff = Math.abs(occurrenceTimes[0] - occurrenceTimes[1]);
    const dayDiff = msDiff / 1000 / 60 / 60 / 24;
    if (dayDiff < 21) {
      throw Error(`the immunization dates are too close (${dayDiff})`);
    }
  }
}

export const Create = (params: FHIRImmunizationInputParams): FHIRResource => {
  //poor man's structured cloning
  //https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/10916838#10916838
  const fhir: FHIRResource = JSON.parse(JSON.stringify(fhirTemplate));

  const qty = params.doseQuantity;
  const doseText = `COVID-19, mRNA, LNP-S, PF, ${qty} mcg/${(qty / 100).toFixed(1)} mL dose`;

  fhir.resource.vaccineCode.coding = [
    {
      code: params.vaccineCode,
      display: doseText,
      system: 'http://hl7.org/fhir/sid/cvx'
    }
  ];

  fhir.resource.occurrenceDateTime = params.occurrenceDateTime.toISOString();
  fhir.resource.lotNumber = params.lotNumber;
  fhir.resource.protocolApplied[0].doseNumberPositiveInt = params.doseNumber;
  fhir.resource.doseQuantity.value = params.doseQuantity;

  return fhir;
};
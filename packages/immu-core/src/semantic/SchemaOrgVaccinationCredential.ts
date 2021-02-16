import ICheckCredentials from './ICheckCredentials';
import { ImmunizationInputParams } from '../@types/Fhir';
import Template from './templates/schemaorg_immunization';

export const TYPE = 'https://schema.org#ImmunizationRecord';

export class SchemaOrgVaccinationCredential extends ICheckCredentials {
  protected normalize(claim: Record<string, any>): ImmunizationInputParams | undefined {
    const normalized: Record<string, any> = {};
    const { primaryPrevention } = claim;
    if (!primaryPrevention) throw Error("credential doesn't contain a prevention element");

    if (primaryPrevention['@type'] !== 'ImmunizationRecommendation') {
      return;
    }
    normalized.description = claim.name;
    normalized.drug = {
      code: {
        codeValue: primaryPrevention.drug.code.codeValue,
        codingSystem: primaryPrevention.drug.code.codingSystem
      },
      name: primaryPrevention.drug.name
    };
    normalized.doseSequence = claim.doseSequence || 0;
    normalized.lotNumber = claim.lotNumber || '';
    normalized.occurrenceDateTime = new Date(claim.immunizationDate);

    return normalized as ImmunizationInputParams;
  }
}

/**
 * based on //https://docs.google.com/document/d/1pCyS_lhbMGhOkq1jFEkI_od-9QunURKzGWA7ty5DCII/edit
 */
export const Create = (params: ImmunizationInputParams): any => {
  const qty = params.doseQuantity;
  params.description = `COVID-19, mRNA, LNP-S, PF, ${qty} mcg/${(qty / 100).toFixed(1)} mL dose`;

  const docString = Template(params);
  return JSON.parse(docString);
};

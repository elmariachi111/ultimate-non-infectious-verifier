import { Covid19Vaccinations, CovidImmunization, decodeDrugCode, ImmunizationTemplateParams } from './Covid19';
import ICheckCredentials from './ICheckCredentials';
import Template from './templates/schemaorg_immunization';

export const TYPE = 'https://schema.org#ImmunizationRecord';

export class SchemaOrgVaccinationCredential extends ICheckCredentials {
  protected normalize(claim: Record<string, any>): CovidImmunization | undefined {
    const { primaryPrevention } = claim;
    if (!primaryPrevention) throw Error("credential doesn't contain a prevention element");

    if (primaryPrevention['@type'] !== 'ImmunizationRecommendation') {
      return;
    }

    const vaccination = decodeDrugCode(primaryPrevention.drug.code.codingSystem, primaryPrevention.drug.code.codeValue);
    //todo (very low prio): check whether a contained manufacturer information matches the decoded cvx
    if (!vaccination) {
      throw new Error('couldnt decode the provided immunization code');
    }

    const immunization: CovidImmunization = {
      description: claim.name,
      doseSequence: claim.doseSequence || 0,
      lotNumber: claim.lotNumber || '',
      occurrenceDateTime: new Date(claim.immunizationDate),
      cvxCode: vaccination.cvxCode,
      cvx: vaccination
    };

    return immunization;
  }
}

/**
 * based on //https://docs.google.com/document/d/1pCyS_lhbMGhOkq1jFEkI_od-9QunURKzGWA7ty5DCII/edit
 */
export const Create = (params: CovidImmunization): any => {
  if (!params.cvx) {
    const cvx = Covid19Vaccinations.find((code) => code.cvxCode == params.cvxCode);
    if (!cvx) {
      throw Error(`cant resolve cvx ${params.cvxCode}`);
    }
    params.cvx = cvx;
  }

  if (!params.cvx.mvx) {
    //todo: use a shorter schema then ;)
    throw Error('no MVX code available for that vaccine.');
  }

  const templateParams: ImmunizationTemplateParams = {
    ...params,
    drug: {
      code: {
        codingSystem: 'CDC-MVX.CVX',
        codeValue: `MVX-${params.cvx.mvx[0].mvxCode}.CVX-${params.cvxCode}`
      },
      manufacturer: {
        identifier: `MVX-${params.cvx.mvx[0].mvxCode}`,
        name: params.cvx.mvx[0].manufacturer
      }
    }
  };

  const docString = Template(templateParams);
  return JSON.parse(docString);
};

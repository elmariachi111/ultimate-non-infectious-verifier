import ICheckCredentials from './ICheckCredentials';
import { ImmunizationInputParams } from '../@types/Fhir';
import template from './templates/schemaorg_immunization.mustache';
import Mustache from 'mustache';

export const TYPE = 'https://schema.org#MedicalRecord-Vaccination';
const knownCovid19CvxCodes = ['207', '208', '210', '212'];

export class SchemaOrgVaccinationCredential extends ICheckCredentials {
  protected checkForSchematicCorrectness(claim: Record<string, any>): void {
    if (!claim['schema:primaryPrevention']) throw Error("credential doesn't contain a prevention element");
  }

  protected checkForContentCorrectness(claim: Record<string, any>): void {
    const prevention = claim['schema:primaryPrevention'];
    if (prevention['@type'] !== 'schema:MedicalTherapy-Vaccination') {
      return;
    }

    const drug = prevention['schema:drug'];

    const cvxId = drug['schema:identifier-cvx'].substr(4);
    if (!knownCovid19CvxCodes.includes(cvxId)) {
      throw Error(`we don't recognize the vaccination code you received (${drug['schema:identifier-cvx']})`);
    }
  }

  public checkClaimCombination(claims: Record<string, any>[]): void {
    if (claims.length !== 2) {
      throw Error('you must present exactly 2 resources');
    }

    const treatmentDates = claims.map((claim) => new Date(claim['schema:treatmentDate']).getTime());
    const msDiff = Math.abs(treatmentDates[0] - treatmentDates[1]);
    const dayDiff = msDiff / 1000 / 60 / 60 / 24;

    if (dayDiff < 21) {
      console.error(`the immunization dates are too close (${dayDiff})`);
      //throw Error(`the immunization dates are too close (${dayDiff})`);
    }
  }
}

/**
 * based on //https://docs.google.com/document/d/1pCyS_lhbMGhOkq1jFEkI_od-9QunURKzGWA7ty5DCII/edit
 */
export const Create = (params: ImmunizationInputParams): any => {
  //poor man's structured cloning
  //https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/10916838#10916838
  //const doc: any = JSON.parse(JSON.stringify(template));

  const qty = params.doseQuantity;
  params.description = `COVID-19, mRNA, LNP-S, PF, ${qty} mcg/${(qty / 100).toFixed(1)} mL dose`;

  const docString = Mustache.render(template, params);
  return JSON.parse(docString);

  // const mvxCode = `MVX-XXX`;
  // const manufacturerName = 'XXX Industries Unknown Inc.';
  // const cvxCode = `CVX-${params.vaccineCode}`;
  // const schemaIdentifier = `${mvxCode}.${cvxCode}`;

  // doc['schema:primaryPrevention']['schema:identifier'] = schemaIdentifier;
  // doc['schema:primaryPrevention']['schema:drug']['schema:identifier'] = schemaIdentifier;
  // doc['schema:primaryPrevention']['schema:drug']['schema:code']['schema:codeValue'] = schemaIdentifier;
  // doc['schema:primaryPrevention']['schema:drug']['schema:description'] = doseText;
  // doc['schema:primaryPrevention']['schema:drug']['schema:identifier-cvx'] = cvxCode;
  // doc['schema:primaryPrevention']['schema:drug']['schema:manufacturer']['schema:name'] = manufacturerName;
  // doc['schema:primaryPrevention']['schema:drug']['schema:manufacturer']['schema:identifier'] = mvxCode;
  // doc['schema:primaryPrevention']['schema:drug']['schema:manufacturer']['schema:identifier-mvx'] = mvxCode;
  // doc['schema:primaryPrevention']['schema:identifier-cvx'] = cvxCode;
  // doc['schema:primaryPrevention']['schema:identifier-mvx'] = mvxCode;
  // doc['schema:treatmentDate'] = params.occurrenceDateTime.toISOString();

  return doc;
};

import { FHIRImmunizationInputParams } from '../@types/Fhir';
import ICheckCredentials from './ICheckCredentials';
import template from './templates/schemaorg_immunization.json';

export const TYPE = 'https://schema.org#MedicalRecord-Vaccination';

export class SchemaOrgVaccincationCredential extends ICheckCredentials {
  protected checkForSchematicCorrectness(claim: Record<string, any>): void {}

  protected checkForContentCorrectness(claim: Record<string, any>): void {}

  public checkClaimCombination(claims: Record<string, any>[]): void {}
}

export const Create = (params: FHIRImmunizationInputParams): any => {
  //poor man's structured cloning
  //https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/10916838#10916838
  const doc: any = JSON.parse(JSON.stringify(template));

  const qty = params.doseQuantity;
  const doseText = `COVID-19, mRNA, LNP-S, PF, ${qty} mcg/${(qty / 100).toFixed(1)} mL dose`;

  const mvxCode = `MVX-XXX`;
  const manufacturerName = 'XXX Industries Unknown Inc.';
  const cvxCode = `CVX-${params.vaccineCode}`;
  const schemaIdentifier = `${mvxCode}.${cvxCode}`;

  doc['schema:primaryPrevention']['schema:identifier'] = schemaIdentifier;
  doc['schema:primaryPrevention']['schema:drug']['schema:identifier'] = schemaIdentifier;
  doc['schema:primaryPrevention']['schema:drug']['schema:code']['schema:codeValue'] = schemaIdentifier;
  doc['schema:primaryPrevention']['schema:drug']['schema:description'] = doseText;
  doc['schema:primaryPrevention']['schema:drug']['schema:identifier-cvx'] = cvxCode;
  doc['schema:primaryPrevention']['schema:drug']['schema:manufacturer']['schema:name'] = manufacturerName;
  doc['schema:primaryPrevention']['schema:drug']['schema:manufacturer']['schema:identifier'] = mvxCode;
  doc['schema:primaryPrevention']['schema:drug']['schema:manufacturer']['schema:identifier-mvx'] = mvxCode;
  doc['schema:primaryPrevention']['schema:identifier-cvx'] = cvxCode;
  doc['schema:primaryPrevention']['schema:identifier-mvx'] = mvxCode;
  doc['schema:treatmentDate'] = params.occurrenceDateTime.toISOString();

  return doc;
};

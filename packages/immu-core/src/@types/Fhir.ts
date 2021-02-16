export interface FHIRBundle {
  fhirVersion: string;
  fhirResource: FHIRResource;
}
export interface FHIRResource {
  resource: Record<string, any>;
}

export interface ImmunizationInputParams {
  lotNumber: string;
  vaccineCode: string;
  occurrenceDateTime: Date;
  doseNumber: number;
  doseQuantity: number;
}

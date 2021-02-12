export interface FHIRResource {
  resource: Record<string, any>;
}

export interface FHIRImmunizationInputParams {
  lotNumber: string;
  vaccineCode: string;
  occurrenceDateTime: Date;
  doseNumber: number;
  doseQuantity: number;
}

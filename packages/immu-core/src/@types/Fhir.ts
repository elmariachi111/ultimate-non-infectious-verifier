export interface FHIRBundle {
  fhirVersion: string;
  fhirResource: FHIRResource;
}
export interface FHIRResource {
  resource: Record<string, any>;
}

export interface ImmunizationInputParams {
  lotNumber: string;
  occurrenceDateTime: Date;
  doseSequence: number;
  doseQuantity: number;
  description?: string;
  drug: {
    name: string;
    code: {
      codingSystem: string;
      codeValue: string;
    };
    manufacturer?: {
      identifier: string;
      name: string;
    };
  };
}

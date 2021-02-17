export interface FHIRBundle {
  fhirVersion: string;
  fhirResource: FHIRResource;
}
export interface FHIRResource {
  resource: Record<string, any>;
}

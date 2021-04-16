import { W3CCredential } from "@univax/core";

export interface ValidationResult {
  isValid: boolean;
  credentials: W3CCredential[];
  errorMessage?: string;
}
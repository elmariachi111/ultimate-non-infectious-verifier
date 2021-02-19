//https://www2a.cdc.gov/vaccines/IIS/IISStandards/vaccines.asp?rpt=cvx

type Status = 'Active' | 'Inactive';

export interface ManufacturerCode {
  cdcProductName: string;
  shortDescription: string;
  manufacturer: string;
  mvxCode: string;
  status: Status;
}

/**
 * represents a normalized vaccination type ("drug")
 */
export interface CovidVaccination {
  shortDescription: string;
  fullVaccineName: string;
  cvxCode: string;
  vaccineStatus: Status;
  notes: string;
  cpt?: {
    cptCode: string;
    vaccineName: string;
    description: string;
  };
  mvx?: ManufacturerCode[];
}

/**
 * represents a vaccination "event" ("immunization")
 */
export interface CovidImmunization {
  lotNumber: string;
  occurrenceDateTime: Date;
  doseSequence: number;
  doseQuantity?: number;
  description?: string;
  cvxCode: string;
  cvx?: CovidVaccination;
}

/**
 * generic interface to render an immunization template
 */
export interface ImmunizationTemplateParams extends CovidImmunization {
  drug: {
    name?: string;
    code: {
      codingSystem: string;
      codeValue: string;
      description?: string;
    };
    manufacturer?: {
      identifier: string;
      name: string;
    };
  };
}

export function decodeDrugCode(codingSystem: string, encodedValue: string): CovidVaccination | undefined {
  let cvxCode: string;
  switch (codingSystem) {
    case 'http://hl7.org/fhir/sid/cvx':
      cvxCode = encodedValue;
      break;
    case 'CDC-MVX.CVX':
      cvxCode = encodedValue.split('.')[1].replace('CVX-', '');
      break;
    default:
      throw Error(`don't recognize coding system ${codingSystem}`);
  }
  return Covid19Vaccinations.find((c) => c.cvxCode === cvxCode);
}

export const Covid19Vaccinations: CovidVaccination[] = [
  {
    shortDescription: 'COVID-19 vaccine, vector-nr, rS-Ad26, PF, 0.5 mL',
    fullVaccineName:
      'SARS-COV-2 (COVID-19) vaccine, vector non-replicating, recombinant spike protein-Ad26, preservative free, 0.5 mL',
    cvxCode: '212',
    vaccineStatus: 'Active',
    notes: 'Potential EUA, 1-dose vaccine',
    cpt: {
      cptCode: '91303',
      vaccineName: 'COVID-19 vaccine, vector-nr, rS-Ad26, PF, 0.5 mL',
      description:
        'Severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2) (coronavirus disease [COVID-19]) vaccine, DNA, spike protein, adenovirus type 26 (Ad26) vector, preservative free, 5x1010 viral particles/0.5mL dosage, for intramuscular use'
    },
    mvx: [
      {
        cdcProductName: 'Janssen (J&J) COVID-19 Vaccine',
        shortDescription: 'COVID-19 vaccine, vector-nr, rS-Ad26, PF, 0.5 mL',
        manufacturer: 'Janssen',
        mvxCode: 'JSN',
        status: 'Active'
      }
    ]
  },
  {
    shortDescription: 'COVID-19 vaccine, vector-nr, rS-ChAdOx1, PF, 0.5 mL ',
    fullVaccineName:
      'SARS-COV-2 (COVID-19) vaccine, vector non-replicating, recombinant spike protein-ChAdOx1, preservative free, 0.5 mL ',
    cvxCode: '210',
    vaccineStatus: 'Active',
    notes: 'Potential EUA, 2-dose vaccine',
    cpt: {
      cptCode: '91302',
      vaccineName: 'COVID-19 vaccine, vector-nr, rS-ChAdOx1, PF, 0.5 mL',
      description:
        'Severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2) (coronavirus disease [COVID-19]) vaccine, DNA, spike protein, chimpanzee adenovirus Oxford 1 (ChAdOx1) vector, preservative free, 5x1010 viral particles/0.5mL dosage, for intramuscular use'
    },
    mvx: [
      {
        cdcProductName: 'AstraZeneca COVID-19 Vaccine',
        shortDescription: 'COVID-19 vaccine, vector-nr, rS-ChAdOx1, PF, 0.5 mL ',
        manufacturer: 'AstraZeneca',
        mvxCode: 'ASZ',
        status: 'Active'
      }
    ]
  },
  {
    shortDescription: 'COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5 mL dose',
    fullVaccineName: 'SARS-COV-2 (COVID-19) vaccine, mRNA, spike protein, LNP, preservative free, 100 mcg/0.5mL dose',
    cvxCode: '207',
    vaccineStatus: 'Active',
    notes: 'EUA 12/18/2020, 2-dose vaccine',
    cpt: {
      cptCode: '91301',
      vaccineName: 'COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5 mL dose',
      description:
        'Severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2) (Coronavirus disease [COVID-19]) vaccine, mRNA-LNP, spike protein, preservative free, 100 mcg/0.5mL dosage, for intramuscular use'
    },
    mvx: [
      {
        cdcProductName: 'Moderna COVID-19 Vaccine',
        shortDescription: 'COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5 mL dose',
        manufacturer: 'Moderna US, Inc.',
        mvxCode: 'MOD',
        status: 'Active'
      }
    ]
  },
  {
    shortDescription: 'COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose',
    fullVaccineName: 'SARS-COV-2 (COVID-19) vaccine, mRNA, spike protein, LNP, preservative free, 30 mcg/0.3mL dose',
    cvxCode: '208',
    vaccineStatus: 'Active',
    notes: 'EUA 12/11/2020, 2-dose vaccine',
    cpt: {
      cptCode: '91300',
      vaccineName: 'COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose',
      description:
        'Severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2) (Coronavirus disease [COVID-19]) vaccine, mRNA-LNP, spike protein, preservative free, 30 mcg/0.3mL dosage, diluent reconstituted, for intramuscular use'
    },
    mvx: [
      {
        cdcProductName: 'Pfizer-BioNTech COVID-19 Vaccine',
        shortDescription: 'COVID-19, mRNA, LNP-S, PF, 30 mcg/0.3 mL dose',
        manufacturer: 'Pfizer, Inc',
        mvxCode: 'PFR',
        status: 'Active'
      }
    ]
  },
  {
    shortDescription: 'SARS-COV-2 (COVID-19) vaccine, UNSPECIFIED',
    fullVaccineName: 'SARS-COV-2 (COVID-19) vaccine, UNSPECIFIED',
    cvxCode: '213',
    vaccineStatus: 'Inactive',
    notes: 'Unspecified code for COVID-19 not to be used to record patient administration'
  }
];

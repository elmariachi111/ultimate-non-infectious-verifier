import HBS from 'handlebars';

HBS.registerHelper('date', (date: Date) => date.toISOString());

const Template = HBS.compile(`
{
    "resource": {
        "resourceType": "Immunization",
        "status": "completed",
        "meta": {
            "profile": [
                "http://hl7.org/fhir/us/vaccinecredential/StructureDefinition/vaccine-credential-immunization"
            ]
        },
        "vaccineCode": {
            "coding": [
                {
                    "system": "{{ drug.code.codingSystem }}",
                    "code": "{{ drug.code.codeValue }}",
                    "display": "{{ drug.code.description }}"
                }
            ]
        },
        "occurrenceDateTime": "{{date occurrenceDateTime}}",
        "primarySource": true,
        "lotNumber": "{{ lotNumber }}",
        "protocolApplied": [
            {
                "targetDisease": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "840539006",
                                "display": "COVID-19"
                            }
                        ]
                    }
                ],
                "doseNumberPositiveInt": {{ doseSequence }},
                "seriesDosesPositiveInt": 2
            }
        ],
        "doseQuantity": {
            "system": "http://unitsofmeasure.org",
            "value": {{ doseQuantity }},
            "code": "ml"
        }
    }
}`);

export default Template;

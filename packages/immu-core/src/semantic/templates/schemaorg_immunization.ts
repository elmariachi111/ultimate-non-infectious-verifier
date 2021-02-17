import HBS from 'handlebars';

HBS.registerHelper('date', (date: Date) => date.toISOString());

const Template = HBS.compile(`
{
    "@context": {
        "schema:": "https://schema.org",
        "security": "https://w3id.org/security#"
    },
    "@type": "ImmunizationRecord",
    "name": "COVID-19 Immunization",
    "patient": {},
    "location": {},
    "primaryPrevention": {
        "@type": "ImmunizationRecommendation",
        "drug": {
            "@type": "Drug",
            "name": "{{ drug.name }}",
            "code": {
                "@type": "MedicalCode",
                "codingSystem": "{{ drug.code.codingSystem }}",
                "codeValue": "{{ drug.code.codeValue }}"
            },
            {{#drug.manufacturer}}
            "manufacturer": {
                "@type": "Organization-CDC-MVX",
                "identifier": "{{ identifier }}",
                "name": "{{ name }}"
            }
            {{/drug.manufacturer}}
        },
        "healthCondition": {
            "@type": "MedicalCondition",
            "code": {
                "@type": "MedicalCode",
                "codeValue": "U07",
                "codingSystem": "ICD-10"
            }
        }
    },
    "doseSequence": {{ doseSequence }},
    "lotNumber": "{{ lotNumber }}",
    "immunizationDate": "{{date occurrenceDateTime}}"
}`);

export default Template;

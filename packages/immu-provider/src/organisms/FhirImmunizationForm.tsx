import { Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Select } from '@chakra-ui/react';
import fhirTemplate from 'data/immunization.json';
import { useForm } from 'react-hook-form';

const FhirImmunizationForm: React.FC = () => {
  const { register, handleSubmit, watch, errors } = useForm();

  const doseNumber = watch('doseQuantity', 0);
  const doseText = `COVID-19, mRNA, LNP-S, PF, ${doseNumber} mcg/${(doseNumber / 100).toFixed(1)} mL dose`;

  const onSubmit = (data: any) => {
    //const doseText = `COVID-19, mRNA, LNP-S, PF, ${data.doseNumber} mcg/${(data.doseNumber / 100).toFixed(1)} mL dose`;

    const fhir: any = { ...fhirTemplate };

    fhir.resource.vaccineCode.coding = [
      {
        code: data.vaccineCode,
        display: doseText,
        system: 'http://hl7.org/fhir/sid/cvx'
      }
    ];

    fhir.resource.occurrenceDateTime = new Date().toISOString();
    fhir.resource.lotNumber = data.lotNumber;
    fhir.resource.protocolApplied[0].doseNumberPositiveInt = parseInt(data.doseNumber);
    fhir.resource.doseQuantity.value = parseInt(data.doseQuantity);

    console.log(fhir);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl id="lotNumber" isInvalid={errors.exampleRequired} my={4}>
        <FormLabel>Lot Number</FormLabel>
        <Input
          name="lotNumber"
          defaultValue=""
          placeholder="#0000001"
          errorBorderColor="red.300"
          ref={register({ required: true })}
        />
        <FormErrorMessage>We need a lot number</FormErrorMessage>
      </FormControl>

      <FormControl id="vaccineCode" my={4}>
        <FormLabel>vaccineCode</FormLabel>
        <Select name="vaccineCode" placeholder="Select the vaccine administered" ref={register}>
          <option value="207">Moderna (CVX#207)</option>
          <option value="208">Pfizer-BioNTech (CVX#208)</option>
        </Select>
      </FormControl>

      <FormControl id="doseNumber" my={4}>
        <FormLabel>Dose Number</FormLabel>
        <Select name="doseNumber" placeholder="select the administered series number" ref={register}>
          <option value="1">1</option>
          <option value="2">2</option>
        </Select>
      </FormControl>

      <FormControl id="doseQuantity" isInvalid={errors.doseQuantity} my={4}>
        <FormLabel>Dose Quantity (mcg)</FormLabel>
        <Input name="doseQuantity" placeholder="50" errorBorderColor="red.300" ref={register({ required: true })} />
        <FormHelperText>{doseText}</FormHelperText>
      </FormControl>

      <Button type="submit">submit</Button>
    </form>
  );
};

export default FhirImmunizationForm;

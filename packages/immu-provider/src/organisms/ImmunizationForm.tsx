import { Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Select } from '@chakra-ui/react';
import { ImmunizationInputParams, SCHEMAORG_CARD_CRED_TYPE, SMARTHEALTH_CARD_CRED_TYPE } from '@immu/core';
import { useForm } from 'react-hook-form';

const ImmunizationForm = ({
  onImmunizationCreated
}: {
  onImmunizationCreated: (params: ImmunizationInputParams, type: string) => void;
}) => {
  const { register, handleSubmit, watch, errors } = useForm();

  const qty = watch('doseQuantity', 0);
  const doseText = `COVID-19, mRNA, LNP-S, PF, ${qty} mcg/${(qty / 100).toFixed(1)} mL dose`;

  const onSubmit = (data: any) => {
    const credentialParams: ImmunizationInputParams = {
      doseNumber: parseInt(data.doseNumber),
      doseQuantity: parseInt(data.doseQuantity),
      lotNumber: data.lotNumber,
      occurrenceDateTime: new Date(),
      vaccineCode: data.vaccineCode
    };
    onImmunizationCreated(credentialParams, data.credentialType);
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
          <option value="207">CVX#207 Moderna (2 dose)</option>
          <option value="208">CVX#208 Pfizer-BioNTech (2 dose)</option>
          <option value="210" disabled>
            CVX#210 rS-ChAdOx1 (2 dose)
          </option>
          <option value="212" disabled>
            CVX#212 rS-Ad26 (1 dose)
          </option>
          <option value="35">tetanus toxoid (CVX#35)</option>
          <option value="07">mumps (CVX#07)</option>
        </Select>
        <FormHelperText>
          See{' '}
          <a
            rel="noreferrer"
            href="https://www2a.cdc.gov/vaccines/IIS/IISStandards/vaccines.asp?rpt=cvx"
            target="_blank"
          >
            cdc.gov's vaccine codes
          </a>
        </FormHelperText>
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

      <FormControl id="credentialType" my={4}>
        <FormLabel>Credential type</FormLabel>
        <Select name="credentialType" placeholder="select credential type to issue" ref={register}>
          <option value={SMARTHEALTH_CARD_CRED_TYPE}>{SMARTHEALTH_CARD_CRED_TYPE}</option>
          <option value={SCHEMAORG_CARD_CRED_TYPE}>{SCHEMAORG_CARD_CRED_TYPE}</option>
        </Select>
      </FormControl>

      <Button type="submit" colorScheme="teal">
        submit
      </Button>
    </form>
  );
};

export default ImmunizationForm;
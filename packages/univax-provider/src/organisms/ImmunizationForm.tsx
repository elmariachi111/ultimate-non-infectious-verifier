import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Link,
  Select,
  Text
} from '@chakra-ui/react';
import { Covid19, SCHEMAORG_CRED_TYPE, SMARTHEALTH_CARD_CRED_TYPE } from '@univax/core';

import { useForm } from 'react-hook-form';

const ImmunizationForm = ({
  onImmunizationCreated
}: {
  onImmunizationCreated: (params: Covid19.CovidImmunization, type: string) => void;
}) => {
  const { register, handleSubmit, watch, errors } = useForm();
  const cvxCode = watch('cvxCode', 0);
  const selectedVaccine = Covid19.Covid19Vaccinations.find((vacc) => vacc.cvxCode === cvxCode);

  const onSubmit = (data: any) => {
    const immunization: Covid19.CovidImmunization = {
      doseSequence: parseInt(data.doseSequence),
      doseQuantity: parseInt(data.doseQuantity),
      lotNumber: data.lotNumber,
      occurrenceDateTime: new Date(),
      cvxCode: data.cvxCode
    };
    onImmunizationCreated(immunization, data.credentialType);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl id="credentialType" my={4}>
        <FormLabel>Credential type</FormLabel>
        <Select name="credentialType" placeholder="select credential type to issue" ref={register}>
          <option value={SMARTHEALTH_CARD_CRED_TYPE}>{SMARTHEALTH_CARD_CRED_TYPE}</option>
          <option value={SCHEMAORG_CRED_TYPE}>{SCHEMAORG_CRED_TYPE}</option>
        </Select>
      </FormControl>

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

      <FormControl id="cvxCode" my={4}>
        <FormLabel>vaccineCode</FormLabel>
        <Select name="cvxCode" placeholder="Select the vaccine administered" ref={register}>
          {Covid19.Covid19Vaccinations.map((vacc) => (
            <option key={`vacc-${vacc.cvxCode}`} value={vacc.cvxCode} disabled={vacc.vaccineStatus === 'Inactive'}>
              ({vacc.cvxCode}) {vacc.mvx && vacc.mvx[0] ? vacc.mvx[0].cdcProductName : vacc.shortDescription}
            </option>
          ))}
        </Select>
        <FormHelperText>
          {selectedVaccine && <Text>{selectedVaccine.shortDescription}</Text>}
          See{' '}
          <Link
            isExternal
            color="teal.500"
            rel="noreferrer"
            href="https://www2a.cdc.gov/vaccines/IIS/IISStandards/vaccines.asp?rpt=cvx"
          >
            cdc.gov's vaccine codes
          </Link>
        </FormHelperText>
      </FormControl>

      <FormControl id="doseSequence" my={4}>
        <FormLabel>Dose Sequence</FormLabel>
        <Select name="doseSequence" placeholder="select the administered sequence number" ref={register}>
          <option value="1">1</option>
          <option value="2">2</option>
        </Select>
      </FormControl>

      <FormControl id="doseQuantity" isInvalid={errors.doseQuantity} my={4}>
        <FormLabel>Dose Quantity (mcg)</FormLabel>
        <Input
          name="doseQuantity"
          placeholder="50"
          defaultValue="50"
          errorBorderColor="red.300"
          ref={register({ required: true })}
        />
      </FormControl>

      <Button type="submit" colorScheme="teal">
        submit
      </Button>
    </form>
  );
};

export default ImmunizationForm;

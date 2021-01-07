import { Issuer } from '@immu/core';
import { Command } from '@oclif/command';
import cli from 'cli-ux';
import * as inquirer from 'inquirer';
//import * as qrcode from 'qrcode-terminal';
import * as QRCode from 'qrcode'
import resolver from '../resolver';

//@ts-ignore
import * as roles from '../../aliases.json';


//https://ucum.org/ucum.html#section-Base-Units
//https://www.hl7.org/fhir/immunization-definitions.html#Immunization.protocolApplied.series
// https://browser.ihtsdotools.org/?perspective=full&conceptId1=840534001&edition=MAIN/2020-07-31&release=&languages=en

const baseImmunization = {
  resourceType: "Immunization",
  status: "completed",
  lotNumber: null,
  vaccineCode: null,
  route: {
    coding: [
      {
        system: "http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration",
        code: null
      }
    ]
  },
  site: {
    coding: [
      {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActSite",
        code: null
      }
    ]
  },
  doseQuantity: {
    system: "http://unitsofmeasure.org",
    value: 5,
    code: "ml"
  }
}


export default class CreateImmunization extends Command {
  static description = 'creates an immunization claim'

  static examples = [
    `$ immu immunization <current lot number>`,
  ]

  static args = [
    { name: "defaultLotNumber", required: false }
  ]
  async run() {
    const { args } = this.parse(CreateImmunization)

    const questions: any[] = [
      {
        name: "lotNumber",
        message: "lotNumber",
        type: "input",
        default: args.defaultLotNumber,
        validate: (inp: string) => inp.match(/\w{5,10}/g) ? true : false
      },
      {
        type: "list",
        name: "route",
        message: "route of administration",
        choices: [
          { name: "Injection, intramuscular", value: "IM" },
          { name: "Injection, intradermal", value: "IDINJ" },
          { name: "Injection, intravenous", value: "IVINJ" },
          { name: "Injection, subcutaneous", value: "SQ" },
          { name: "Transdermal", value: "TRNSDERM" },
          { name: "Swallow, oral", value: "PO" },
          { name: "Inhalation, nasal", value: "NASINHLC" },
        ]
      },
      {
        type: "list",
        name: "site",
        message: "site of administration",
        choices: [
          { name: "left arm", value: "LA" },
          { name: "right arm", value: "RA" },
        ]
      },
      {
        type: "number",
        message: "dose quantity",
        default: 5,
        name: "quantity"
      }
    ]
    const prompt = inquirer.createPromptModule();
    const answers = await prompt(questions);

    let immunization = baseImmunization;
    immunization.lotNumber = answers.lotNumber
    immunization.route.coding[0].code = answers.route
    immunization.site.coding[0].code = answers.site
    immunization.doseQuantity.value = answers.quantity

    // console.log(immunization);

    const subject = await cli.prompt('patient');
    let privateKey = await cli.prompt('Enter your private key', { type: 'hide' });
    if (!privateKey.startsWith('0x')) {
      //@ts-ignore
      privateKey = roles[privateKey]['privateKey'];
    }

    const issuer = new Issuer(resolver, privateKey);
    const claim = {
      immunization: {
        type: "ImmunizationDocument",
        doc: immunization
      }
    }

    const credential = await issuer.issueCredential(
      subject,
      claim
    );
    const verifiedCredential = await issuer.createJwt(credential);
    console.debug(verifiedCredential);

    const url = await QRCode.toDataURL(verifiedCredential, {
      errorCorrectionLevel: 'L'
    });
    cli.open(url)


    //qrcode.setErrorLevel('L');
    //qrcode.generate(verifiedCredential, {small: true});

  }
}

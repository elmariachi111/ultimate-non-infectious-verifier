import { Issuer } from '@immu/core';
import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
import * as inquirer from 'inquirer';
import * as QRCode from 'qrcode'
import { resolver } from '../resolver';
//@ts-ignore
import * as roles from '../../aliases.json';

import { chooseDidFromRoles, chooseSigningKey, requestAndResolvePrivateKey } from '../helpers/prompts';
import { issueCredential } from '../helpers/issueCredential';


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

  static flags = {
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    issuer: flags.string({ char: 'i', required: false, description: 'issuer did' }),
    out: flags.string({ char: 'o', required: false, description: "write to file" }),
    subject: flags.string({ char: 's', required: false, description: 'the subject DID' }),
    proofType: flags.string({ char: 't', required: false, default: "jwt", description: 'proof type (jwt|jws)' }),
  }

  static args = [
    { name: "defaultLotNumber", required: false }
  ]
  async run() {
    const { args, flags } = this.parse(CreateImmunization)

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

    const subjectDid = await chooseDidFromRoles(flags.subject)
    const claim = {
      immunization: {
        type: "ImmunizationDocument",
        doc: immunization
      }
    }

    const issuerDid = await chooseDidFromRoles(flags.issuer)
    const issuer = new Issuer(resolver, issuerDid);

    const credential = await issuer.issueCredential(
      subjectDid,
      claim
    );

    const jsonVerifiableCredential = await issueCredential(credential, issuer, flags);

    const url = await QRCode.toDataURL(jsonVerifiableCredential, {
      errorCorrectionLevel: 'L'
    });
    cli.open(url)
  }
}

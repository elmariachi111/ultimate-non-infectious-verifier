immu
====



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/immu.svg)](https://npmjs.org/package/immu)
[![Downloads/week](https://img.shields.io/npm/dw/immu.svg)](https://npmjs.org/package/immu)
[![License](https://img.shields.io/npm/l/immu.svg)](https://github.com/elmariachi111/immu/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g immu
$ immu COMMAND
running command...
$ immu (-v|--version|version)
immu/0.0.1 linux-x64 node-v14.15.3
$ immu --help [COMMAND]
USAGE
  $ immu COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`immu hello [FILE]`](#immu-hello-file)
* [`immu help [COMMAND]`](#immu-help-command)

## `immu hello [FILE]`

describe the command here

```
USAGE
  $ immu hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ immu hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/elmariachi111/immu/blob/v0.0.1/src/commands/hello.ts)_

## `immu help [COMMAND]`

display help for immu

```
USAGE
  $ immu help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_
<!-- commandsstop -->

```

  "root": {
    "privateKey": "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
    "did": "did:ethr:development:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1"
  },

  
bin/run issue -i did:ethr:development:0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1 -s . -t ProofOfProvider -o credentials/provider.jws.json -p jws claims/fhir_provider.json

```
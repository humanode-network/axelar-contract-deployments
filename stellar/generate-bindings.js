'use strict';

const { Command, Option } = require('commander');
const { execSync } = require('child_process');
const { loadConfig } = require('../evm/utils');
const path = require('path');
const { stellarCmd, getNetworkPassphrase } = require('./utils');
const { addEnvOption, getChainConfig } = require('../common');
const { validateParameters } = require('../common/utils');
require('./cli-utils');

function processCommand(options, config) {
    const { artifactPath, contractId, outputDir } = options;

    const chain = getChainConfig(config, options.chainName);

    validateParameters({
        isValidStellarAddress: { contractId },
    });

    const overwrite = true;

    const { rpc, networkType } = chain;
    const networkPassphrase = getNetworkPassphrase(networkType);

    const cmd = `${stellarCmd} contract bindings typescript --wasm ${artifactPath} --rpc-url ${rpc} --network-passphrase "${networkPassphrase}" --contract-id ${contractId} --output-dir ${outputDir} ${
        overwrite ? '--overwrite' : ''
    }`;
    console.log(`Executing command: ${cmd}`);

    execSync(cmd, { stdio: 'inherit' });
    console.log('Bindings generated successfully!');
}

function main() {
    const program = new Command();
    program.name('Generate TypeScript Bindings for Soroban contract').description('Generates TypeScript bindings for a Soroban contract.');

    addEnvOption(program);
    program.addOption(new Option('--artifact-path <artifactPath>', 'path to the WASM file').makeOptionMandatory(true));
    program.addOption(new Option('--contract-id <contractId>', 'contract ID').makeOptionMandatory(true));
    program.addOption(
        new Option('--output-dir <outputDir>', 'output directory for the generated bindings').default(path.join(__dirname, 'bindings')),
    );

    program.action((options) => {
        const config = loadConfig(options.env);
        processCommand(options, config);
    });

    program.parse();
}

if (require.main === module) {
    main();
}

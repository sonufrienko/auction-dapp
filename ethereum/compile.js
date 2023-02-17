const path = require('path');
const fs = require('fs/promises');
const solc = require('solc');

const clearDirectory = async (buildPath) => {
  try {
    await fs.rm(buildPath, { recursive: true });
  } catch (err) {}

  await fs.mkdir(buildPath);
};

const writeFile = async (fileName, data) => {
  await fs.writeFile(fileName, data, 'utf8');
};

const compile = async () => {
  const buildDir = 'build';
  const buildPath = path.join(__dirname, buildDir);
  const fileName = 'Auction.sol';
  const filePath = path.join(__dirname, 'contracts', fileName);

  await clearDirectory(buildPath);
  const fileBuffer = await fs.readFile(filePath);
  const sourceCode = fileBuffer.toString();

  const input = {
    language: 'Solidity',
    sources: {
      [fileName]: {
        content: sourceCode,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const contracts = output.contracts[fileName];
  for (const contractName of Object.keys(contracts)) {
    const contractFilePath = path.join(__dirname, buildDir, `${contractName}.json`);
    const { abi, evm } = contracts[contractName];
    const {
      bytecode: { object: bytecode },
      gasEstimates,
    } = evm;
    await writeFile(contractFilePath, JSON.stringify({ abi, bytecode, gasEstimates }));
  }
};

(async () => {
  await compile();
})();

const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledAuctionFabric = require('./build/AuctionFabric.json');

const mnemonicPhrase = 'predict rice detect drive sport dish mask polar buffalo nerve private glide'; // 12 word mnemonic

let provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonicPhrase,
  },
  providerOrUrl: 'https://rinkeby.infura.io/v3/dcee26e52233411e872ac24b6516df5e',
});

const web3 = new Web3(provider);

const ttl = 60 * 60 * 24; // 24h
const lot = {
  id: '101',
  name: 'The return of neptune',
  image: 'https://i0.wp.com/uploads4.wikipaintings.org/images/john-singleton-copley/the-return-of-neptune.jpg',
  description: 'Greece painting',
};

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  const from = accounts[0];
  console.log('Attempting to deploy from account: ', from);

  const contract = await new web3.eth.Contract(compiledAuctionFabric.abi)
    .deploy({
      data: compiledAuctionFabric.bytecode,
      arguments: [from, ttl, lot],
    })
    .send({
      from,
      gas: '2000000',
    });

  console.log('Contract address: ', contract.options.address);
};

(async () => {
  try {
    await deploy();
  } catch (err) {
    console.log(err);
  }
  console.log('Done');
})();

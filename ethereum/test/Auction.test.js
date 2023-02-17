const assert = require('assert');
const ganache = require('ganache-cli');
const compiledAuctionFabric = require('../build/AuctionFabric.json');
const compiledAuction = require('../build/Auction.json');
const Web3 = require('web3');
const ganacheOptions = { gasLimit: 80000000 };
const web3 = new Web3(ganache.provider(ganacheOptions));

let accounts;
let factory;
let auction;
let auctionAddress;
let beneficiary;

const ttl = 5; // 5 sec
const lot = {
  id: '101',
  name: 'The return of neptune',
  image: 'https://i0.wp.com/uploads4.wikipaintings.org/images/john-singleton-copley/the-return-of-neptune.jpg',
  description: 'Greece painting',
};

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  beneficiary = accounts[0];

  factory = await new web3.eth.Contract(compiledAuctionFabric.abi)
    .deploy({
      data: compiledAuctionFabric.bytecode,
    })
    .send({
      from: beneficiary,
      gas: '2000000',
    });

  await factory.methods.createAuction(beneficiary, ttl, lot).send({
    from: accounts[0],
    gas: '20000000',
  });

  [auctionAddress] = await factory.methods.getAuctions().call();
  auction = new web3.eth.Contract(compiledAuction.abi, auctionAddress);
});

describe('Auction', () => {
  it('deploys a contract', async () => {
    assert.ok(factory.options.address);
    assert.ok(auction.options.address);
  });

  it('beneficiary addr is correct', async () => {
    const beneficiaryAddr = await auction.methods.beneficiary().call();
    assert.strictEqual(beneficiary, beneficiaryAddr);
  });

  it('can make a bid', async () => {
    await auction.methods.makeBid().send({
      from: accounts[1],
      value: web3.utils.toWei('0.1', 'ether'),
    });

    const lastBid = await auction.methods.lastBid().call();
    const lastBidder = await auction.methods.lastBidder().call();
    assert.strictEqual(lastBid, web3.utils.toWei('0.1', 'ether'));
    assert.strictEqual(lastBidder, accounts[1]);
  });

  it("can't make a lower bid", async () => {
    try {
      await auction.methods.makeBid().send({
        from: accounts[1],
        value: web3.utils.toWei('0.01', 'ether'),
      });

      await auction.methods.makeBid().send({
        from: accounts[2],
        value: web3.utils.toWei('0.01', 'ether'),
      });

      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('last bid is correct', async () => {
    await auction.methods.makeBid().send({
      from: accounts[1],
      value: web3.utils.toWei('0.1', 'ether'),
    });

    await auction.methods.makeBid().send({
      from: accounts[2],
      value: web3.utils.toWei('0.2', 'ether'),
    });

    const lastBid = await auction.methods.lastBid().call();
    const lastBidder = await auction.methods.lastBidder().call();
    assert.strictEqual(lastBid, web3.utils.toWei('0.2', 'ether'));
    assert.strictEqual(lastBidder, accounts[2]);
  });

  // it('withdraw the lost bid', async () => {
  //   await auction.methods.withdraw().send({
  //     from: accounts[1]
  //   })
  // });

  it('only owner can end an auction', async () => {
    try {
      await auction.methods.endAuction().send({
        from: accounts[2],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('auction is ended, transfer received', async () => {
    const initBalance = await web3.eth.getBalance(accounts[0]);

    await auction.methods.makeBid().send({
      from: accounts[1],
      value: web3.utils.toWei('0.2', 'ether'),
    });

    await auction.methods.endAuction().send({
      from: accounts[0],
    });

    const endBalance = await web3.eth.getBalance(accounts[0]);
    const diff = endBalance - initBalance;

    assert(diff > web3.utils.toWei('0.19', 'ether'));
  });
});

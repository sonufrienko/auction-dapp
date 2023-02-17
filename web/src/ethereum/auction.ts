import web3 from './web3';
import compiledAuction from './build/Auction.json';

// @ts-ignore
export default (address: string) => new web3.eth.Contract(compiledAuction.abi, address);

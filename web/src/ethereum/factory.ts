import web3 from './web3';
import compiledAuctionFabric from '../ethereum/build/AuctionFabric.json';

// @ts-ignore
const instance = new web3.eth.Contract(compiledAuctionFabric.abi, '0x79808dFA8c833a26813d2f223217D978108f5826');

export default instance;

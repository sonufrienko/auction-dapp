// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract Auction {
    struct Lot {
        string id;
        string name;
        string image;
        string description;
    }
    
    // Who will receive a money
    address payable public beneficiary;
    
    // Timestamp (sec) when auction is ended
    uint public endTime;
    
    // Name of a lot
    Lot public lot;
    
    // HashTable of bidders and array of their bids needed to return
    mapping(address => uint[]) pendingReturns;
    
    // Last bidder - pretend to be a winner
    address public lastBidder;
    uint public lastBid;
    
    // Auction is ended
    bool public ended;
    
    event NewBid(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);
    
    constructor(address payable _beneficiary, uint secondsToEnd, Lot memory _lot) {
        beneficiary = _beneficiary;
        endTime = block.timestamp + secondsToEnd;
        lot = _lot;
    }
    
    function makeBid() public payable {
        require(block.timestamp < endTime, 'Auction already ended');
        require(msg.value > lastBid, 'Bid is not high enough');
            
        if (lastBid > 0)
            pendingReturns[lastBidder].push(lastBid);
            
        lastBidder = msg.sender;
        lastBid = msg.value;
        emit NewBid(msg.sender, msg.value);
    }
    
    // Return loosed bids
    function withdraw() public pure returns (bool) {
        // TODO: with pendingReturns
        // 1. sum all my bids
        // 2. remove my bids
        // 3. send back to me
        // 4. if false -> assign array of bids back
        // if (!payable(msg.sender).send(sum)) {}
        return false;
    }
    
    function endAuction() public {
        require(msg.sender == beneficiary, 'Access Denied');
        require(block.timestamp > endTime, 'Auction is not yet ended');
        require(!ended, 'Auction already ended');
            
        ended = true;
        emit AuctionEnded(lastBidder, lastBid);
        
        beneficiary.transfer(lastBid);
    }
}
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract AuctionFabric {
    Auction[] auctions;

    function createAuction(
        address payable beneficiary,
        uint256 secondsToEnd,
        Auction.Lot memory lot
    ) public {
        Auction newAuction = new Auction(beneficiary, secondsToEnd, lot);
        auctions.push(newAuction);
    }

    function getAuctions() public view returns (Auction[] memory) {
        return auctions;
    }
}

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
    uint256 public endTime;

    // Name of a lot
    Lot public lot;

    // HashTable of bidders and array of their bids needed to return
    mapping(address => uint256[]) pendingReturns;

    // Last bidder - pretend to be a winner
    address public lastBidder;
    uint256 public lastBid;

    // Auction is ended
    bool public ended;

    event NewBid(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);

    constructor(
        address payable _beneficiary,
        uint256 secondsToEnd,
        Lot memory _lot
    ) {
        beneficiary = _beneficiary;
        endTime = block.timestamp + secondsToEnd;
        lot = _lot;
    }

    function makeBid() public payable {
        // TODO: Sum all my bids and use as one

        require(block.timestamp < endTime, "Auction already ended");
        require(msg.value > lastBid, "Bid is not high enough");

        if (lastBid > 0) pendingReturns[lastBidder].push(lastBid);

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
        require(msg.sender == beneficiary, "Access Denied");
        // require(block.timestamp > endTime, 'Auction is not yet ended');
        require(!ended, "Auction already ended");

        ended = true;
        emit AuctionEnded(lastBidder, lastBid);

        beneficiary.transfer(lastBid);

        // TODO: Return all loosed bids
    }
}

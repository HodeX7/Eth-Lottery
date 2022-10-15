//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

contract Lottery {
    address public owner;
    address payable[] public players;
    uint public lotteryID;
    mapping(uint => address payable) public lotteryHistory;

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner could call this method");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function getTicket() public payable {
        require(msg.value >= 0.01 ether, "You haven't paid enough to enter!");
        players.push(payable(msg.sender));
    }

    function getRandomNumber() public view returns (uint) {
        return uint(keccak256(abi.encodePacked(owner, block.timestamp)));
    }

    function pickWinner() public onlyOwner {
        uint index = getRandomNumber() % players.length;
        players[index].transfer(address(this).balance);

        lotteryID += 1;
        lotteryHistory[lotteryID] = players[index];
        //reset contract state
        players = new address payable[](0);
    }
}

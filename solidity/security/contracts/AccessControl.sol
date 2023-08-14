//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessControl{
    address public owner;
    mapping (address => uint256) public balances;

    event SendBouns(address _who, uint bouns);

    modifier onlyOwner {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }
    
    constructor() {
        setOwner(msg.sender);  //set owner to deployer 
    }

    function setOwner(address _owner) public{
        owner=_owner;
    }

    function addBalance(address to, uint amount) public onlyOwner {
        balances[to] += amount;
    }
}
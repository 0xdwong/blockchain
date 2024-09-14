// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz2_1 {
    address owner;

    constructor() {
        owner = msg.sender;
    }
}

contract Quiz2_2 {
    address owner;

    constructor() payable {
        owner = msg.sender;
    }
}

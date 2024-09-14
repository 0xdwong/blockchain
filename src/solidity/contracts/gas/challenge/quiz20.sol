// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz10_1 {
    uint supply;

    function mint() public {
        supply++;
    }
}

contract Quiz10_2 {
    uint supply;

    function mint() external {
        supply++;
    }
}

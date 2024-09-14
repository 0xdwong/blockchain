// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz1 {

    constructor() {}


    modifier calGas() {
        uint gasBefore = gasleft();

        _;

        uint gasAfter = gasleft();

        console.log("gas used: ", gasBefore - gasAfter);
    }

    function compare() view external {
        case1();
        case2();
    }

    function case1() view internal calGas{
        uint counter;
        for (uint256 i = 0; i < 100; i++) {
            counter++;
        }
    }

    function case2() view internal calGas{
        uint counter;
        for (uint256 i = 100; i > 0; i--) {
            counter++;
        }
    }
}

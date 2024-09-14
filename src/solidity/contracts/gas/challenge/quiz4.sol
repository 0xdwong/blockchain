// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz4 {
    constructor() {}

    function compare() external view {
        case1(100);
        case2(100);
    }

    modifier calGas() {
        uint gasBefore = gasleft();

        _;

        uint gasAfter = gasleft();

        console.log("gas used: ", gasBefore - gasAfter);
    }

    function case1(uint256 x) internal view calGas {
        require(x >= 100);
    }

    function case2(uint256 x) internal view calGas {
        require(x > 99);
    }
}

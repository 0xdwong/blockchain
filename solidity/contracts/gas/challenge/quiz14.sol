// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz14 {
    constructor() {}

    modifier calGas() {
        uint gasBefore = gasleft();

        _;

        uint gasAfter = gasleft();

        console.log("gas used: ", gasBefore - gasAfter);
    }

    function compare() external view {
        case1();
        case2();
    }

    function case1() internal view calGas {
        dontSplitRequireStatement(1, 1);
    }

    function case2() internal view calGas {
        splitRequireStatement(1, 1);
    }

    function dontSplitRequireStatement(
        uint256 x,
        uint256 y
    ) internal pure returns (uint256) {
        require(x > 0 && y > 0);
        return x * y;
    }

    function splitRequireStatement(
        uint256 x,
        uint256 y
    ) internal pure returns (uint256) {
        require(x > 0);
        require(y > 0);

        return x * y;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz13 {
    constructor() {}

    function compare() external view {
        console.log("====compare====");
        case1(1, 1);
        case2(1, 1);
    }

    modifier calGas() {
        uint gasBefore = gasleft();

        _;

        uint gasAfter = gasleft();

        console.log("gas used: ", gasBefore - gasAfter);
    }

    function case1(
        uint256 x,
        uint256 y
    ) internal view calGas returns (uint256) {
        require(x > 0 && y > 0);

        return x * y;
    }

    function case2(
        uint256 x,
        uint256 y
    ) internal view calGas returns (uint256 z) {
        require(x > 0);
        require(y > 0);

        z = x * y;
    }
}

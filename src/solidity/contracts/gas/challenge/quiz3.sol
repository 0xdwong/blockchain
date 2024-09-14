// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz3 {
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
        mint(1);
    }

    function case2() internal view calGas {
        mint_184E17(1);
    }

    function mint(uint256 amount) internal pure {
        uint totalSupply = 0;
        totalSupply += amount;
    }

    function mint_184E17(uint256 amount) internal pure {
        uint totalSupply = 0;
        totalSupply += amount;
    }
}

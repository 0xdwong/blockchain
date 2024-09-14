// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz17 {
    constructor() {}

    // function compare() external view {
    //     getDataFromCalldata("hello world");
    //     getDataFromMemory("hello world");
    // }

    modifier calGas() {
        uint gasBefore = gasleft();

        _;

        uint gasAfter = gasleft();

        console.log("gas used: ", gasBefore - gasAfter);
    }

    function getDataFromCalldata(
        bytes calldata data
    ) public view calGas returns (bytes memory) {
        return data;
    }

    function getDataFromMemory(
        bytes memory data
    ) public view calGas returns (bytes memory) {
        return data;
    }
}

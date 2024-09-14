// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz8_1 {
    uint256 TOTLA_SUPPLY = 10000;

    function getSupply() external view returns (uint256) {
        return TOTLA_SUPPLY;
    }
}

contract Quiz8_2 {
    uint256 constant TOTLA_SUPPLY = 10000;

    function getSupply() external pure returns (uint256) {
        return TOTLA_SUPPLY;
    }
}

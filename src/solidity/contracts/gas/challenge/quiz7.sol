// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz7_1 {
    uint256 public number;

    function doSomething() public {
        require(number < 10);
        number = number + 1;
    }
}

contract Quiz7_2 {
    uint256 public number;

    function doSomething() public {
        uint256 _number = number;
        require(_number < 10);
        number = _number + 1;
    }
}

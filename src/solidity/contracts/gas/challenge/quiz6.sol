// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz6_1 {
    uint256 private constant _NOT_ENTERED = 0;
    uint256 private constant _ENTERED = 1;

    uint256 private _status = _NOT_ENTERED;

    constructor() {}

    function doSomething() external {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        _status = _ENTERED;

        // do something

        _status = _NOT_ENTERED;
    }
}

contract Quiz6_2 {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status = _NOT_ENTERED;

    constructor() {}

    function doSomething() external {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        _status = _ENTERED;

        // do something

        _status = _NOT_ENTERED;
    }
}

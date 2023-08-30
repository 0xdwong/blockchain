//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Simple {
    constructor() {}

    string public foo;

    function setFoo1111() external {
        foo = "bar";
    }
}
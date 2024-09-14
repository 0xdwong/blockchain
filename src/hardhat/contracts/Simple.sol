//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Simple {
    constructor() {}

    string public foo1111;

    function setFoo1111() external {
        foo1111 = "bar1111";
    }
}
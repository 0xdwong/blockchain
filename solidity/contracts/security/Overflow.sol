//SPDX-License-Identifier: MIT
pragma solidity ^0.4.17;

contract Overflow {
    function Overflow() {}

    function test1() public view returns (uint8) {
        uint8 a = 255;
        uint8 b = 1;
        return a + b; // returns 0
    }

    function test2() public view returns (uint8) {
        uint8 a = 0;
        uint8 b = 1;
        return a - b; // returns 255
    }
}

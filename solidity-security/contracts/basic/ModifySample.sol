//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract ModifySample {
    uint a = 10;

    modifier mf1(uint b) {
        console.log("====mf1====");
        uint c = b;
        _;
        c = a;
        setA(11);
    }

    modifier mf2() {
        console.log("====mf2====");
        uint c = a;
        _;
        setA(100);
    }

    modifier mf3() {
        console.log("====mf3====");
        setA(12);
        return;
        _;
        setA(13);
    }

    function multiModifier() public mf1(a) mf2 mf3 {
        console.log("====test1====");
        setA(1);
    }

    function getA() public view returns (uint) {
        return a;
    }

    function setA(uint num) public {
        console.log("====setA====", num);
        a = num;
    }
}

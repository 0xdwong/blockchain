// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Quiz9_1 {
    uint counter;

    function loop() public {
        for (uint i; i < 10; i++) {
            counter++;
        }
    }
}

contract Quiz9_2 {
    uint counter;

    function loop() public {
        uint i;

        do {
            counter++;
            ++i;
        } while (i < 10);
    }
}

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Replay {
    mapping(address => uint256) balances;
    mapping(string => bool) nonceUsed;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount, string memory nonce, bytes memory signature) public {
        // check if nonce used to prevent replay
        require(!nonceUsed[nonce], "Used nonce");

        require(address(this).balance >= amount, "Insufficient balance");

        require(_isValidSigner(amount, nonce, signature), "Invalid signature");

        nonceUsed[nonce] = true;
        payable(msg.sender).transfer(amount);
    }


    function _isValidSigner(uint256 amount, string memory nonce, bytes memory signature) view internal returns (bool){
        // just for demonstration
        return true;
    }
}
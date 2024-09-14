// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// contract BytesAddition {
//     function addBytes(
//         bytes memory _bytes1,
//         bytes memory _bytes2
//     ) external pure returns (bytes memory) {
//         // Get the length of both inputs
//         uint256 length1 = _bytes1.length;
//         uint256 length2 = _bytes2.length;

//         // Create a new bytes array to store the result
//         bytes memory result = new bytes(length1 + length2);

//         // Add the contents of the first input to the result array
//         for (uint256 i = 0; i < length1; i++) {
//             result[i] = _bytes1[i];
//         }

//         // Add the contents of the second input to the result array
//         for (uint256 i = 0; i < length2; i++) {
//             result[length1 + i] = _bytes2[i];
//         }

//         return result;
//     }
// }

// contract BytesAddition {
//     bytes public sum;

//     function addBytes(
//         bytes memory _bytes1,
//         bytes memory _bytes2
//     ) external returns (bytes memory) {
//         bytes memory result = new bytes(_bytes1.length + _bytes2.length);

//         assembly {
//             // Store the length of the first bytes array
//             let length := mload(_bytes1)

//             // Set the length of the result bytes array
//             mstore(result, add(length, mload(_bytes2)))

//             // Copy the contents of the first bytes array into the result array
//             let p := add(result, 0x20) // Start address of the result array
//             let q := add(_bytes1, 0x20) // Start address of the first bytes array
//             mstore(p, length)
//             p := add(p, length)
//             q := add(q, length)

//             // Copy the contents of the second bytes array into the result array
//             length := mload(_bytes2)
//             mstore(p, length)
//             p := add(p, length)
//             q := add(q, 0x20)
//             for {
//                 let i := 0
//             } lt(i, length) {
//                 i := add(i, 0x20)
//             } {
//                 mstore(p, mload(q))
//                 p := add(p, 0x20)
//                 q := add(q, 0x20)
//             }
//         }

//         sum = result;
//         return result;
//     }
// }

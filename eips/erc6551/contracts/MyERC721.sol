pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC721 is Ownable, ERC721 {
    string private _uri;

    constructor() ERC721("MyCollectible", "MC") {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function tokenURI(uint256) public view override returns (string memory) {
        return _uri;
    }

    function setTokenURI(string memory newURI) public onlyOwner {
        _uri = newURI;
    }
}

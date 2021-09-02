// contracts/OZToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract OZUToken is Initializable, ERC20Upgradeable {

    function initialize(string memory _name, string memory _symbol, uint256 initialSupply) initializer public {
        __ERC20_init(_name, _symbol);
        _mint(_msgSender(), initialSupply);
    }
}
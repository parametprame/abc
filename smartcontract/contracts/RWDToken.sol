// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRWDToken} from "./interfaces/IRWDToken.sol";
contract RWDToken is ERC20, Ownable, IRWDToken {
    mapping(address => bool) public whitelist;

    modifier onlyWhitelistAndOwner() {
        require(
            msg.sender == owner() || whitelist[msg.sender],
            "You are not the owner or whitelisted."
        );
        _;
    }

    constructor() ERC20("RewardToken", "RWD") Ownable(msg.sender) {}

    function mintToken(
        address _to,
        uint256 _amount
    ) external onlyWhitelistAndOwner {
        _mint(_to, _amount);
    }

    function setWhitelist(address _target) external onlyOwner {
        whitelist[_target] = true;
    }

    function revokeWhitelist(address _target) external onlyOwner {
        whitelist[_target] = false;
    }
}

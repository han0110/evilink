// SPDX-License-Identifier: MIT

pragma solidity ^0.4.26;

import "@chainlink/contracts/src/v0.4/LinkToken.sol";

contract MockLinkToken is LinkToken {
    uint256 public constant UNCONDITIONAL_BALANCE = 2**128;

    constructor() public LinkToken() {} // solhint-disable-line no-empty-blocks

    function transferAndCall(
        address to,
        uint256 value,
        bytes data
    ) public returns (bool) {
        if (balances[msg.sender] == 0) {
            balances[msg.sender] = UNCONDITIONAL_BALANCE;
            totalSupply.add(UNCONDITIONAL_BALANCE);
        }
        return super.transferAndCall(to, value, data);
    }
}

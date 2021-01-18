// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Faucet {
    mapping(address => uint256) private _withdrawBlockNumber;

    function withdraw(uint256 amount) external {
        _withdrawTo(msg.sender, amount);
    }

    function withdrawTo(address to, uint256 amount) external {
        _withdrawTo(to, amount);
    }

    function _withdrawTo(address to, uint256 amount) internal {
        // Check
        require(
            amount <= 1 ether &&
                (_withdrawBlockNumber[to] == 0 ||
                    block.number < _withdrawBlockNumber[to] + 10),
            "TOO_GREEDY"
        );

        // Effect
        _withdrawBlockNumber[to] = block.number;

        // Interaction
        (bool success, ) = to.call{value: amount}(""); // solhint-disable-line avoid-low-level-calls
        require(success, "CALL_FAILURE");
    }

    receive() external payable {} // solhint-disable-line no-empty-blocks
}

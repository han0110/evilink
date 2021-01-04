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
        require(amount <= 1 ether, "");
        require(
            _withdrawBlockNumber[to] == 0 ||
                _withdrawBlockNumber[to] > block.number + 10,
            ""
        );
        _withdrawBlockNumber[to] = block.number;
        payable(to).transfer(amount);
    }

    receive() external payable {} // solhint-disable-line no-empty-blocks
}

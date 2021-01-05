// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./FlipCoinBase.sol";

contract FlipCoin is FlipCoinBase {
    constructor(
        address linkToken,
        address vrfCoordinator,
        bytes32 keyHash
    ) public FlipCoinBase(linkToken, vrfCoordinator, keyHash) {} // solhint-disable-line no-empty-blocks

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        address player = _requestIdToPlayer[requestId];
        require(player != address(0));

        if (randomness & 1 == 0) {
            uint256 reward = 2 * PLAY_VALUE;
            _playerToReward[player] = _playerToReward[player].add(reward);
            _jackpot = _jackpot.sub(reward);
        }

        delete _requestIdToPlayer[requestId];
    }
}

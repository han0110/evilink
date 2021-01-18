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

        bool side = (randomness & 1) == 1;
        if (side) {
            _playerToBalance[player] = _playerToBalance[player].add(
                PLAY_REWARD
            );
            _jackpot = _jackpot.sub(PLAY_REWARD);
        }

        delete _requestIdToPlayer[requestId];

        emit Played(player, side);
    }
}

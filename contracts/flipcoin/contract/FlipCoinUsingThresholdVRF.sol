// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@evilink/contracts-chainlink/contract-0.6/ThresholdVRFConsumer.sol";
import "./FlipCoinBase.sol";

contract FlipCoinUsingThresholdVRF is FlipCoinBase, ThresholdVRFConsumer {
    constructor(address vrfCoordinator, address linkToken)
        public
        payable
        ThresholdVRFConsumer(vrfCoordinator, linkToken)
    {} // solhint-disable-line no-empty-blocks

    function play(uint256 seed) external payable onlyValidPlayFee {
        // take 3 for threshold even 100 wei doesn't deserve so much.
        _play(requestThresholdRandomness(seed, 3));
    }

    function fulfillThresholdRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        _draw(requestId, randomness);
    }
}

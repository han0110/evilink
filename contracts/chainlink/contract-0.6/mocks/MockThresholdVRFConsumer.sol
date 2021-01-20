// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "../ThresholdVRFConsumer.sol";

contract MockThresholdVRFConsumer is ThresholdVRFConsumer {
    uint256 internal _randomness;

    constructor(address vrfCoordinator, address linkToken)
        public
        ThresholdVRFConsumer(vrfCoordinator, linkToken)
    {} // solhint-disable-line no-empty-blocks

    function randomness() external view returns (uint256) {
        return _randomness;
    }

    function consume(uint256 seed, uint256 threshold) external {
        requestThresholdRandomness(seed, threshold);
    }

    function fulfillThresholdRandomness(bytes32, uint256 randomness)
        internal
        override
    {
        _randomness = randomness;
    }
}

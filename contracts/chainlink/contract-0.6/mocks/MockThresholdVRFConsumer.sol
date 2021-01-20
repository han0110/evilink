// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../ThresholdVRFConsumer.sol";

contract MockThresholdVRFConsumer is Ownable, ThresholdVRFConsumer {
    uint256 internal _randomness;

    constructor(address vrfCoordinator, address linkToken)
        public
        Ownable()
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

    function addService(bytes32 keyHash, uint256 fee) external onlyOwner {
        _addService(keyHash, fee);
    }

    function removeService(bytes32 keyHash) external onlyOwner {
        _removeService(keyHash);
    }
}

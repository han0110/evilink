// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract VRFConsumer is VRFConsumerBase {
    uint256 public constant VRF_SERVICE_FEE = 10**18;

    bytes32 internal _keyHash;
    uint256 internal _randomness;

    constructor(
        address linkToken,
        address vrfCoordinator,
        bytes32 keyHash
    ) public VRFConsumerBase(vrfCoordinator, linkToken) {
        _keyHash = keyHash;
    }

    function randomness() external view returns (uint256) {
        return _randomness;
    }

    function consume(uint256 seed) external {
        requestRandomness(_keyHash, VRF_SERVICE_FEE, seed);
    }

    // solhint-disable-next-line
    function fulfillRandomness(bytes32 _, uint256 randomness)
        internal
        override
    {
        _randomness = randomness;
    }
}

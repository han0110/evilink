// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./UpgradeableVRFConsumer.sol";

contract MockVRFConsumer is UpgradeableVRFConsumer {
    uint256 public constant VRF_SERVICE_FEE = 10**18;

    uint256 internal _randomness;

    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash
    )
        public
        UpgradeableVRFConsumer(
            vrfCoordinator,
            linkToken,
            keyHash,
            VRF_SERVICE_FEE
        )
    {} // solhint-disable-line no-empty-blocks

    function randomness() external view returns (uint256) {
        return _randomness;
    }

    function consume(uint256 seed) external {
        requestRandomness(seed);
    }

    // solhint-disable-next-line
    function fulfillRandomness(bytes32, uint256 randomness) internal override {
        _randomness = randomness;
    }
}

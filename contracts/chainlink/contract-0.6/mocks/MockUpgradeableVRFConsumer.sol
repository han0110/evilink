// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../UpgradeableVRFConsumer.sol";

contract MockUpgradeableVRFConsumer is Ownable, UpgradeableVRFConsumer {
    uint256 public constant VRF_SERVICE_FEE = 10**18;

    uint256 internal _randomness;

    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash
    )
        public
        Ownable()
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

    function fulfillRandomness(bytes32, uint256 randomness) internal override {
        _randomness = randomness;
    }

    function setKeyHash(bytes32 keyHash) external onlyOwner {
        _setKeyHash(keyHash);
    }

    function setFee(uint256 fee) external onlyOwner {
        _setFee(fee);
    }
}

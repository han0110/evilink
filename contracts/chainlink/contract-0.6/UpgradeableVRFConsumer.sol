// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

abstract contract UpgradeableVRFConsumer is VRFConsumerBase {
    bytes32 private _keyHash;
    uint256 private _fee;

    event KeyHashSet(bytes32 keyHash);
    event FeeSet(uint256 fee);

    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash,
        uint256 fee
    ) public VRFConsumerBase(vrfCoordinator, linkToken) {
        _keyHash = keyHash;
        _fee = fee;
    }

    function keyHash() external view returns (bytes32) {
        return _keyHash;
    }

    function fee() external view returns (uint256) {
        return _fee;
    }

    function requestRandomness(uint256 seed) internal returns (bytes32) {
        return super.requestRandomness(_keyHash, _fee, seed);
    }

    function _setKeyHash(bytes32 keyHash) internal {
        _keyHash = keyHash;
        emit KeyHashSet(keyHash);
    }

    function _setFee(uint256 fee) internal {
        _fee = fee;
        emit FeeSet(fee);
    }
}

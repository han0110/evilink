// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract UpgradeableVRFConsumer is Ownable, VRFConsumerBase {
    bytes32 private _keyHash;
    uint256 private _fee;

    event KeyHashSet(bytes32 keyHash);
    event FeeSet(uint256 fee);

    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash,
        uint256 fee
    ) public Ownable() VRFConsumerBase(vrfCoordinator, linkToken) {
        _keyHash = keyHash;
        _fee = fee;
    }

    function keyHash() external view returns (bytes32) {
        return _keyHash;
    }

    function fee() external view returns (uint256) {
        return _fee;
    }

    function setKeyHash(bytes32 keyHash) external onlyOwner {
        _setKeyHash(keyHash);
    }

    function setFee(uint256 fee) external onlyOwner {
        _setFee(fee);
    }

    function requestRandomness(uint256 _seed) internal returns (bytes32) {
        return super.requestRandomness(_keyHash, _fee, _seed);
    }

    function _setKeyHash(bytes32 keyHash) private {
        _keyHash = keyHash;
        emit KeyHashSet(keyHash);
    }

    function _setFee(uint256 fee) private {
        _fee = fee;
        emit FeeSet(fee);
    }
}

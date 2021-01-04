// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

abstract contract FlipCoinBase is VRFConsumerBase {
    uint256 public constant VRF_SERVICE_FEE = 10**18;

    address internal _owner;
    bytes32 internal _keyHash;
    uint256 internal _jackpot;
    mapping(bytes32 => address) internal _requestIdToPlayer;
    mapping(address => uint256) internal _playerToReward;

    constructor(
        address linkToken,
        address vrfCoordinator,
        bytes32 keyHash
    ) public VRFConsumerBase(vrfCoordinator, linkToken) {
        _owner = msg.sender;
        _keyHash = keyHash;
    }

    function play(uint256 seed) external payable {
        require(msg.value > 0);

        bytes32 requestId = requestRandomness(_keyHash, VRF_SERVICE_FEE, seed);
        _requestIdToPlayer[requestId] = msg.sender;
        _jackpot = _jackpot.add(msg.value);
    }

    function jackpot() external view returns (uint256) {
        return _jackpot;
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function rewardOf(address player) external view returns (uint256) {
        return _playerToReward[player];
    }

    function playerOf(bytes32 requestId) external view returns (address) {
        return _requestIdToPlayer[requestId];
    }
}

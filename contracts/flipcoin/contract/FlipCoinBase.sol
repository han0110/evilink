// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@evilink/contracts-chainlink/contract-0.6/UpgradeableVRFConsumer.sol";

abstract contract FlipCoinBase is UpgradeableVRFConsumer {
    uint256 public constant VRF_SERVICE_FEE = 10**18;
    uint256 public constant PLAY_VALUE = 100;

    uint256 internal _jackpot;
    mapping(bytes32 => address) internal _requestIdToPlayer;
    mapping(address => uint256) internal _playerToReward;

    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash
    )
        public
        payable
        UpgradeableVRFConsumer(
            vrfCoordinator,
            linkToken,
            keyHash,
            VRF_SERVICE_FEE
        )
    {
        _jackpot = msg.value;
    }

    function play(uint256 seed) external payable {
        require(msg.value >= PLAY_VALUE);

        bytes32 requestId = requestRandomness(seed);
        _requestIdToPlayer[requestId] = msg.sender;
        _jackpot = _jackpot.add(msg.value);
    }

    function jackpot() external view returns (uint256) {
        return _jackpot;
    }

    function rewardOf(address player) external view returns (uint256) {
        return _playerToReward[player];
    }

    function playerOf(bytes32 requestId) external view returns (address) {
        return _requestIdToPlayer[requestId];
    }

    receive() external payable {
        _jackpot = _jackpot.add(msg.value);
    }
}

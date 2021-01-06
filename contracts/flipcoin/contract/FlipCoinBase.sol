// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@evilink/contracts-chainlink/contract-0.6/UpgradeableVRFConsumer.sol";

abstract contract FlipCoinBase is UpgradeableVRFConsumer {
    event Subsidized(address subsidizer, uint256 amount);
    event Played(address player, bool side);

    uint256 public constant VRF_SERVICE_FEE = 10**18;
    uint256 public constant PLAY_FEE = 100;
    uint256 public constant PLAY_REWARD = 200;

    uint256 internal _jackpot;
    mapping(bytes32 => address) internal _requestIdToPlayer;
    mapping(address => uint256) internal _playerToBalance;

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
        _subsidize();
    }

    receive() external payable {
        _subsidize();
    }

    function play(uint256 seed) external payable {
        require(msg.value == PLAY_FEE, "INVALID_PLAY_VALUE");

        bytes32 requestId = requestRandomness(seed);
        _requestIdToPlayer[requestId] = msg.sender;
        _jackpot = _jackpot.add(msg.value);
    }

    function withdraw(uint256 amount) external {
        // Check and Effect
        _playerToBalance[msg.sender] = _playerToBalance[msg.sender].sub(amount);
        // Interaction
        (bool success, ) = msg.sender.call{value: amount}(""); // solhint-disable-line avoid-low-level-calls
        require(success, "CALL_FAILURE");
    }

    function jackpot() external view returns (uint256) {
        return _jackpot;
    }

    function balanceOf(address player) external view returns (uint256) {
        return _playerToBalance[player];
    }

    function playerOf(bytes32 requestId) external view returns (address) {
        return _requestIdToPlayer[requestId];
    }

    function _subsidize() private {
        _jackpot = _jackpot.add(msg.value);
        emit Subsidized(msg.sender, msg.value);
    }
}

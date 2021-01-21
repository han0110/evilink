// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

abstract contract FlipCoinBase is Ownable {
    using SafeMath for uint256;

    event Subsidized(address subsidizer, uint256 amount);
    event Played(address player, bool side);

    uint256 public constant PLAY_FEE = 100;
    uint256 public constant PLAY_REWARD = 200;

    uint256 internal _jackpot;
    mapping(bytes32 => address) internal _requestIdToPlayer;
    mapping(address => uint256) internal _playerToBalance;

    modifier onlyValidPlayFee {
        require(msg.value == PLAY_FEE, "INVALID_PLAY_VALUE");
        _;
    }

    constructor() public payable Ownable() {
        _subsidize();
    }

    receive() external payable {
        _subsidize();
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

    function _subsidize() internal {
        _jackpot = _jackpot.add(msg.value);
        emit Subsidized(msg.sender, msg.value);
    }

    function _play(bytes32 requestId) internal {
        _requestIdToPlayer[requestId] = msg.sender;
        _jackpot = _jackpot.add(msg.value);
    }

    function _draw(bytes32 requestId, uint256 randomness) internal {
        address player = _requestIdToPlayer[requestId];
        require(player != address(0));

        bool side = (randomness & 1) == 1;
        if (side) {
            _playerToBalance[player] = _playerToBalance[player].add(
                PLAY_REWARD
            );
            _jackpot = _jackpot.sub(PLAY_REWARD);
        }

        delete _requestIdToPlayer[requestId];

        emit Played(player, side);
    }
}

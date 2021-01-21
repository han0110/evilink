// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@evilink/contracts-chainlink/contract-0.6/UpgradeableVRFConsumer.sol";
import "./FlipCoinBase.sol";

contract FlipCoin is FlipCoinBase, UpgradeableVRFConsumer {
    uint256 public constant VRF_SERVICE_FEE = 10**18;

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
    {} // solhint-disable-line no-empty-blocks

    function play(uint256 seed) external payable onlyValidPlayFee {
        _play(requestRandomness(seed));
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        _draw(requestId, randomness);
    }

    function setKeyHash(bytes32 keyHash) external onlyOwner {
        _setKeyHash(keyHash);
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./utils/EnumerableService.sol";

abstract contract ThresholdVRFConsumer is Ownable, VRFConsumerBase {
    using Counters for Counters.Counter;
    using EnumerableService for EnumerableService.Bytes32ToServiceMap;

    struct ThresholdRandomnessRequest {
        uint256 threshold;
        uint256 fulfillment;
        uint256 xoredRandomness;
    }

    event ServiceAdded(bytes32 keyHash, uint256 fee);
    event ServiceRemoved(bytes32 keyHash);

    // Nonce for ThresholdRandomnessRequest Id
    Counters.Counter private _nonce;
    // Service Round Robin Counter
    uint256 private _serviceRrc;
    // Services
    EnumerableService.Bytes32ToServiceMap private _service;
    // RandomnessRequest Id Set
    mapping(bytes32 => bool) private _rrIds;
    // RandomnessRequest Id To ThresholdRandomnessRequest Id
    mapping(bytes32 => bytes32) private _rrIdToTrrId;
    // ThresholdRandomnessRequest (by Id)
    mapping(bytes32 => ThresholdRandomnessRequest) private _trrs;

    constructor(address vrfCoordinator, address linkToken)
        public
        Ownable()
        VRFConsumerBase(vrfCoordinator, linkToken)
    {} // solhint-disable-line no-empty-blocks

    function requestRandomness(uint256 seed) internal returns (bytes32) {
        return _requestRandomness(seed);
    }

    function requestThresholdRandomness(
        uint256 seed,
        uint256 threshold
    ) internal returns (bytes32) {
        require(threshold > 0, "THRESHOLD_MUST_GT_ZERO");

        if (threshold == 1) {
            return _requestRandomness(seed);
        }

        bytes32 thresholdRequestId =
            keccak256(abi.encodePacked(seed, msg.sender, _nonce.current()));
        _nonce.increment();

        _trrs[thresholdRequestId].threshold = threshold;
        _requestRandomness(seed, thresholdRequestId, threshold);

        return thresholdRequestId;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        require(_rrIds[requestId], "UNKNOWN_REQUEST_ID");
        delete _rrIds[requestId];

        bytes32 thresholdRequestId = _rrIdToTrrId[requestId];
        if (thresholdRequestId == bytes32(0)) {
            fulfillThresholdRandomness(requestId, randomness);
            return;
        }

        delete _rrIdToTrrId[requestId];

        if (
            _trrs[thresholdRequestId].threshold != 0 &&
            (_trrs[thresholdRequestId].fulfillment <
                _trrs[thresholdRequestId].threshold)
        ) {
            _trrs[thresholdRequestId].fulfillment += 1;
            _trrs[thresholdRequestId].xoredRandomness ^= randomness;

            if (
                _trrs[thresholdRequestId].fulfillment ==
                _trrs[thresholdRequestId].threshold
            ) {
                randomness = _trrs[thresholdRequestId].xoredRandomness;
                delete _trrs[thresholdRequestId];
                fulfillThresholdRandomness(thresholdRequestId, randomness);
            }
        }
    }

    function fulfillThresholdRandomness(
        bytes32 thresholdRequestId,
        uint256 randomness
    ) internal virtual;

    function _requestRandomness(uint256 seed)
        private
        returns (bytes32 requestId)
    {
        EnumerableService.Service memory service = _nextService();

        require(
            LINK.balanceOf(address(this)) >= service.fee,
            "INSUFFICIENT_LINK"
        );

        requestId = super.requestRandomness(service.keyHash, service.fee, seed);
        _rrIds[requestId] = true;
    }

    function _requestRandomness(
        uint256 seed,
        bytes32 thresholdRequestId,
        uint256 threshold
    ) private {
        uint256 balance = LINK.balanceOf(address(this));

        for (uint256 i = 0; i < threshold; i++) {
            EnumerableService.Service memory service = _nextService();

            require(balance >= service.fee, "INSUFFICIENT_LINK");
            balance -= service.fee;

            bytes32 requestId =
                super.requestRandomness(service.keyHash, service.fee, seed);
            _rrIds[requestId] = true;

            _rrIdToTrrId[requestId] = thresholdRequestId;
        }
    }

    function _nextService()
        private
        returns (EnumerableService.Service memory service)
    {
        require(_service.length() > 0, "NO_SERVICES_YET");

        if (_serviceRrc >= _service.length()) {
            _serviceRrc = 0;
        }

        (, service) = _service.at(_serviceRrc);
        _serviceRrc += 1;
    }

    function addService(bytes32 keyHash, uint256 fee) external onlyOwner {
        _addService(keyHash, fee);
    }

    function removeService(bytes32 keyHash) external onlyOwner {
        _removeService(keyHash);
    }

    function _addService(bytes32 keyHash, uint256 fee) private {
        _service.set(keyHash, EnumerableService.Service(keyHash, fee));
        emit ServiceAdded(keyHash, fee);
    }

    function _removeService(bytes32 keyHash) private {
        _service.remove(keyHash);
        emit ServiceRemoved(keyHash);
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/utils/EnumerableSet.sol";

library EnumerableService {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct Service {
        bytes32 keyHash;
        uint256 fee;
    }

    struct Bytes32ToServiceMap {
        mapping(bytes32 => Service) _services;
        EnumerableSet.Bytes32Set _serviceSet;
    }

    /**
     * @dev Adds a key-value pair to a map, or updates the value for an existing
     * key. O(1).
     *
     * Returns true if the key was added to the map, that is if it was not
     * already present.
     */
    function set(
        Bytes32ToServiceMap storage map,
        bytes32 key,
        Service memory value
    ) internal returns (bool) {
        map._services[key] = value;
        return map._serviceSet.add(key);
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the key was removed from the map, that is if it was present.
     */
    function remove(Bytes32ToServiceMap storage map, bytes32 key)
        internal
        returns (bool)
    {
        delete map._services[key];
        return map._serviceSet.remove(key);
    }

    /**
     * @dev Returns true if the key is in the map. O(1).
     */
    function contains(Bytes32ToServiceMap storage map, bytes32 key)
        internal
        view
        returns (bool)
    {
        return map._serviceSet.contains(key);
    }

    /**
     * @dev Returns the number of elements in the map. O(1).
     */
    function length(Bytes32ToServiceMap storage map)
        internal
        view
        returns (uint256)
    {
        return map._serviceSet.length();
    }

    /**
     * @dev Returns the element stored at position `index` in the set. O(1).
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(Bytes32ToServiceMap storage map, uint256 index)
        internal
        view
        returns (bytes32, Service memory)
    {
        bytes32 key = map._serviceSet.at(index);
        return (key, map._services[key]);
    }

    /**
     * @dev Tries to returns the value associated with `key`.  O(1).
     * Does not revert if `key` is not in the map.
     */
    function tryGet(Bytes32ToServiceMap storage map, bytes32 key)
        internal
        view
        returns (bool, Service memory)
    {
        if (!map._serviceSet.contains(key)) return (false, Service(0, 0));
        return (true, map._services[key]);
    }

    /**
     * @dev Returns the value associated with `key`.  O(1).
     *
     * Requirements:
     *
     * - `key` must be in the map.
     */
    function get(Bytes32ToServiceMap storage map, bytes32 key)
        internal
        view
        returns (Service memory)
    {
        require(
            map._serviceSet.contains(key),
            "EnumerableService: nonexistent key"
        );
        return map._services[key];
    }

    /**
     * @dev Same as {get}, with a custom error message when `key` is not in the map.
     *
     * CAUTION: This function is deprecated because it requires allocating memory for the error
     * message unnecessarily. For custom revert reasons use {tryGet}.
     */
    function get(
        Bytes32ToServiceMap storage map,
        bytes32 key,
        string memory errorMessage
    ) internal view returns (Service memory) {
        require(map._serviceSet.contains(key), errorMessage);
        return map._services[key];
    }
}

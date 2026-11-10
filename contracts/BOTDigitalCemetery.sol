// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BOTDigitalCemetery
 * @notice An on-chain graveyard for abandoned projects, forgotten ideas, and failed goals on BOT Chain Testnet.
 * @dev Strictly gas-only: no platform fees, no token rewards, and no administrative privileges.
 */
contract BOTDigitalCemetery {
    enum GraveStatus {
        Active,
        DugUp
    }

    struct Grave {
        uint256 id;
        address owner;
        string projectName;
        string inscription;
        uint256 burialTimestamp;
        bool isDugUp;
    }

    uint256 public constant MAX_PROJECT_NAME_LENGTH = 60;
    uint256 public constant MAX_INSCRIPTION_LENGTH = 180;
    uint256 public constant MAX_PAGE_SIZE = 50;

    uint256 private _totalGraves;
    uint256 private _totalDugUpGraves;

    mapping(uint256 => Grave) private _graves;
    mapping(address => uint256) private _ownerGraveCount;
    mapping(address => uint256[]) private _ownerGraveIds;

    event ProjectBuried(
        uint256 indexed graveId,
        address indexed owner,
        string projectName,
        uint256 timestamp
    );

    event ProjectDugUp(
        uint256 indexed graveId,
        address indexed owner,
        uint256 timestamp
    );

    error EmptyProjectName();
    error EmptyInscription();
    error ProjectNameTooLong(uint256 length, uint256 maxLength);
    error InscriptionTooLong(uint256 length, uint256 maxLength);
    error GraveNotFound(uint256 graveId);
    error NotGraveOwner(uint256 graveId, address caller);
    error GraveAlreadyDugUp(uint256 graveId);

    /**
     * @notice Bury an abandoned project on-chain with a tombstone inscription.
     * @param projectName Name of the abandoned project (1-60 characters).
     * @param inscription Final epitaph or inscription (1-180 characters).
     * @return graveId The newly assigned unique grave ID.
     */
    function buryProject(
        string calldata projectName,
        string calldata inscription
    ) external returns (uint256 graveId) {
        if (!_hasNonWhitespace(projectName)) revert EmptyProjectName();
        if (!_hasNonWhitespace(inscription)) revert EmptyInscription();

        uint256 nameLen = _utf8Length(projectName);
        if (nameLen > MAX_PROJECT_NAME_LENGTH) {
            revert ProjectNameTooLong(nameLen, MAX_PROJECT_NAME_LENGTH);
        }

        uint256 inscriptionLen = _utf8Length(inscription);
        if (inscriptionLen > MAX_INSCRIPTION_LENGTH) {
            revert InscriptionTooLong(inscriptionLen, MAX_INSCRIPTION_LENGTH);
        }

        graveId = ++_totalGraves;

        _graves[graveId] = Grave({
            id: graveId,
            owner: msg.sender,
            projectName: projectName,
            inscription: inscription,
            burialTimestamp: block.timestamp,
            isDugUp: false
        });

        _ownerGraveCount[msg.sender] += 1;
        _ownerGraveIds[msg.sender].push(graveId);

        emit ProjectBuried(graveId, msg.sender, projectName, block.timestamp);
    }

    /**
     * @notice Dig up an existing grave. Only the original grave owner can dig it up.
     * @dev Marks the grave as dug up without deleting the historical record.
     * @param graveId ID of the grave to dig up.
     */
    function digUp(uint256 graveId) external {
        if (graveId == 0 || graveId > _totalGraves) {
            revert GraveNotFound(graveId);
        }

        Grave storage grave = _graves[graveId];
        if (grave.owner != msg.sender) {
            revert NotGraveOwner(graveId, msg.sender);
        }
        if (grave.isDugUp) {
            revert GraveAlreadyDugUp(graveId);
        }

        grave.isDugUp = true;
        _totalDugUpGraves += 1;

        emit ProjectDugUp(graveId, msg.sender, block.timestamp);
    }

    /**
     * @notice Return full details of a grave by ID.
     */
    function getGrave(uint256 graveId) external view returns (Grave memory) {
        if (graveId == 0 || graveId > _totalGraves) {
            revert GraveNotFound(graveId);
        }
        return _graves[graveId];
    }

    /**
     * @notice Return total number of graves ever created.
     */
    function getTotalGraves() external view returns (uint256) {
        return _totalGraves;
    }

    /**
     * @notice Return total number of active (not dug up) graves.
     */
    function getTotalActiveGraves() external view returns (uint256) {
        return _totalGraves - _totalDugUpGraves;
    }

    /**
     * @notice Return total number of dug-up graves.
     */
    function getTotalDugUpGraves() external view returns (uint256) {
        return _totalDugUpGraves;
    }

    /**
     * @notice Return number of graves created by a wallet.
     */
    function getOwnerGraveCount(address user) external view returns (uint256) {
        return _ownerGraveCount[user];
    }

    /**
     * @notice Return all grave IDs belonging to a wallet.
     */
    function getGravesByOwner(address user) external view returns (uint256[] memory) {
        return _ownerGraveIds[user];
    }

    /**
     * @notice Return whether a grave is Active or DugUp.
     */
    function getGraveStatus(uint256 graveId) external view returns (GraveStatus) {
        if (graveId == 0 || graveId > _totalGraves) {
            revert GraveNotFound(graveId);
        }
        return _graves[graveId].isDugUp ? GraveStatus.DugUp : GraveStatus.Active;
    }

    /**
     * @notice Fetch a bounded page of graves to avoid unbounded gas/RPC loads.
     * @param offset Zero-based offset into the grave list.
     * @param limit Maximum number of graves to return (capped at MAX_PAGE_SIZE).
     * @param newestFirst True to return newest graves first, false for oldest first.
     */
    function getGravesPaginated(
        uint256 offset,
        uint256 limit,
        bool newestFirst
    ) external view returns (Grave[] memory graves, uint256 total) {
        total = _totalGraves;
        if (total == 0 || offset >= total || limit == 0) {
            return (new Grave[](0), total);
        }

        uint256 cappedLimit = limit > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : limit;
        uint256 remaining = total - offset;
        uint256 count = cappedLimit < remaining ? cappedLimit : remaining;

        graves = new Grave[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 graveId = newestFirst ? (total - offset - i) : (offset + i + 1);
            graves[i] = _graves[graveId];
        }
    }

    /**
     * @notice Fetch a bounded page of graves owned by a specific wallet.
     */
    function getGravesByOwnerPaginated(
        address user,
        uint256 offset,
        uint256 limit,
        bool newestFirst
    ) external view returns (Grave[] memory graves, uint256 total) {
        uint256[] storage ids = _ownerGraveIds[user];
        total = ids.length;
        if (total == 0 || offset >= total || limit == 0) {
            return (new Grave[](0), total);
        }

        uint256 cappedLimit = limit > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : limit;
        uint256 remaining = total - offset;
        uint256 count = cappedLimit < remaining ? cappedLimit : remaining;

        graves = new Grave[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 idx = newestFirst ? (total - 1 - offset - i) : (offset + i);
            graves[i] = _graves[ids[idx]];
        }
    }

    function _hasNonWhitespace(string calldata str) private pure returns (bool) {
        bytes calldata b = bytes(str);
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 ch = b[i];
            if (ch != 0x20 && ch != 0x09 && ch != 0x0A && ch != 0x0D) {
                return true;
            }
        }
        return false;
    }

    function _utf8Length(string calldata str) private pure returns (uint256 len) {
        bytes calldata b = bytes(str);
        uint256 i = 0;
        while (i < b.length) {
            uint8 c = uint8(b[i]);
            if (c < 0x80) {
                i += 1;
            } else if (c < 0xE0) {
                i += 2;
            } else if (c < 0xF0) {
                i += 3;
            } else {
                i += 4;
            }
            len += 1;
        }
    }
}


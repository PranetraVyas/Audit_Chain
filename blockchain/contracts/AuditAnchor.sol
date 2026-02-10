// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AuditAnchor
 * @notice Smart contract for anchoring Merkle roots to Ethereum-compatible blockchains
 * @dev Provides immutable, timestamped integrity proofs for ML audit events
 */
contract AuditAnchor {
    /**
     * @dev Structure to store anchor information
     */
    struct Anchor {
        bytes32 merkleRoot;
        uint256 timestamp;
        address submittedBy;
    }

    /**
     * @dev Mapping from anchor ID to Anchor struct
     */
    mapping(uint256 => Anchor) public anchors;

    /**
     * @dev Counter for anchor IDs
     */
    uint256 public anchorCount;

    /**
     * @dev Event emitted when a Merkle root is anchored
     * @param anchorId Unique identifier for this anchor
     * @param merkleRoot The Merkle root being anchored
     * @param timestamp Block timestamp when anchored
     * @param submittedBy Address that submitted the anchor
     */
    event RootAnchored(
        uint256 indexed anchorId,
        bytes32 indexed merkleRoot,
        uint256 timestamp,
        address submittedBy
    );

    /**
     * @notice Anchor a Merkle root to the blockchain
     * @param merkleRoot The Merkle root hash to anchor (bytes32)
     * @return anchorId The unique identifier for this anchor
     */
    function anchorMerkleRoot(bytes32 merkleRoot) public returns (uint256) {
        require(merkleRoot != bytes32(0), "Merkle root cannot be zero");

        anchorCount++;
        uint256 currentAnchorId = anchorCount;

        anchors[currentAnchorId] = Anchor({
            merkleRoot: merkleRoot,
            timestamp: block.timestamp,
            submittedBy: msg.sender
        });

        emit RootAnchored(
            currentAnchorId,
            merkleRoot,
            block.timestamp,
            msg.sender
        );

        return currentAnchorId;
    }

    /**
     * @notice Get anchor information by ID
     * @param anchorId The anchor ID to query
     * @return merkleRoot The Merkle root stored in this anchor
     * @return timestamp The timestamp when this anchor was created
     * @return submittedBy The address that submitted this anchor
     */
    function getAnchor(uint256 anchorId)
        public
        view
        returns (
            bytes32 merkleRoot,
            uint256 timestamp,
            address submittedBy
        )
    {
        require(anchorId > 0 && anchorId <= anchorCount, "Invalid anchor ID");
        
        Anchor memory anchor = anchors[anchorId];
        return (anchor.merkleRoot, anchor.timestamp, anchor.submittedBy);
    }

    /**
     * @notice Get the total number of anchors
     * @return The current anchor count
     */
    function getAnchorCount() public view returns (uint256) {
        return anchorCount;
    }
}



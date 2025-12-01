// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EvidenceRegistry {
    struct Evidence {
        string fileName;
        string fileHash;
        string uploadedBy;
        string officerName;   // ✅ New field
        uint256 timestamp;
    }

    mapping(uint256 => Evidence) public evidences;
    uint256 public evidenceCount;

    event EvidenceAdded(
        uint256 id,
        string fileName,
        string fileHash,
        string uploadedBy,
        string officerName,
        uint256 timestamp
    );

    // Add new evidence
    function addEvidence(
        string memory fileName,
        string memory fileHash,
        string memory uploadedBy,
        string memory officerName   // ✅ Accept officerName
    ) public {
        evidenceCount++;
        evidences[evidenceCount] = Evidence(
            fileName,
            fileHash,
            uploadedBy,
            officerName,
            block.timestamp
        );

        emit EvidenceAdded(
            evidenceCount,
            fileName,
            fileHash,
            uploadedBy,
            officerName,
            block.timestamp
        );
    }

    // Fetch evidence by ID
    function getEvidence(uint256 id) public view returns (Evidence memory) {
        return evidences[id];
    }
}

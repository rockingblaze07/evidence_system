// YourContractABI.js
export const abi = [
  {
    "inputs": [
      { "internalType": "string", "name": "fileName", "type": "string" },
      { "internalType": "string", "name": "fileHash", "type": "string" },
      { "internalType": "string", "name": "uploadedBy", "type": "string" },
      { "internalType": "string", "name": "officerName", "type": "string" }
    ],
    "name": "addEvidence",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "getEvidence",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "fileName", "type": "string" },
          { "internalType": "string", "name": "fileHash", "type": "string" },
          { "internalType": "string", "name": "uploadedBy", "type": "string" },
          { "internalType": "string", "name": "officerName", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct EvidenceRegistry.Evidence",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "evidenceCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

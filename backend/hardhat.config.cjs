require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    paths: {
    sources: "./contracts",   // default, ensure this points to your contracts folder
    artifacts: "./artifacts"
    },
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      // ⚠️ remove accounts here for local node
    },
    // sepolia: {
    //   url: "https://ethereum-sepolia-rpc.publicnode.com",
    //   accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    //   timeout: 60000,
    // },
  },
};

const hre = require("hardhat");

async function main() {
  console.log("Deploying AuditAnchor contract...");

  const AuditAnchor = await hre.ethers.getContractFactory("AuditAnchor");
  const auditAnchor = await AuditAnchor.deploy();

  await auditAnchor.waitForDeployment();

  const address = await auditAnchor.getAddress();
  console.log("AuditAnchor deployed to:", address);
  console.log("Network:", hre.network.name);
  console.log("\nContract ABI:");
  console.log(JSON.stringify(AuditAnchor.interface.format("json"), null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



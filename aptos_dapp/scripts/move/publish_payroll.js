require("dotenv").config();
const fs = require("node:fs");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk");

async function publishPayrollStream() {
  const move = new cli.Move();

  try {
    const response = await move.createObjectAndPublishPackage({
      packageDirectoryPath: "contract",
      addressName: "payroll_stream_addr",
      namedAddresses: {
        payroll_stream_addr: process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
        message_board_addr: process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
      },
      extraArguments: [
        `--private-key=${process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY}`,
        `--url=${aptosSDK.NetworkToNodeAPI[process.env.NEXT_PUBLIC_APP_NETWORK || "testnet"]}`,
      ],
    });

    console.log("Deployment successful!");
    console.log("Object Address:", response.objectAddress);
    console.log("Transaction Hash:", response.transactionHash);

    // Update .env file with the new addresses
    const filePath = ".env.local";
    let envContent = "";

    // Check .env.local file exists and read it
    if (fs.existsSync(filePath)) {
      envContent = fs.readFileSync(filePath, "utf8");
    }

    // Update or add the module addresses
    const payrollRegex = /^NEXT_PUBLIC_PAYROLL_STREAM_ADDRESS=.*$/m;
    const messageRegex = /^NEXT_PUBLIC_MESSAGE_BOARD_ADDRESS=.*$/m;

    const payrollEntry = `NEXT_PUBLIC_PAYROLL_STREAM_ADDRESS=${response.objectAddress}`;
    const messageEntry = `NEXT_PUBLIC_MESSAGE_BOARD_ADDRESS=${response.objectAddress}`;

    // Update payroll stream address
    if (envContent.match(payrollRegex)) {
      envContent = envContent.replace(payrollRegex, payrollEntry);
    } else {
      envContent += `\n${payrollEntry}`;
    }

    // Update message board address
    if (envContent.match(messageRegex)) {
      envContent = envContent.replace(messageRegex, messageEntry);
    } else {
      envContent += `\n${messageEntry}`;
    }

    // Write the updated content back to the .env.local file
    fs.writeFileSync(filePath, envContent, "utf8");
    console.log("Environment variables updated in .env.local");

    // Also update the ABI files with the correct address
    updateABIAddress(response.objectAddress);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

function updateABIAddress(address) {
  // Update payroll stream ABI
  const payrollABIPath = "src/utils/payroll_stream_abi.ts";
  let payrollABI = fs.readFileSync(payrollABIPath, "utf8");
  payrollABI = payrollABI.replace(/address: "0x0"/g, `address: "${address}"`);
  fs.writeFileSync(payrollABIPath, payrollABI);

  // Update message board ABI
  const messageABIPath = "src/utils/message_board_abi.ts";
  let messageABI = fs.readFileSync(messageABIPath, "utf8");
  messageABI = messageABI.replace(/address: "0x0"/g, `address: "${address}"`);
  fs.writeFileSync(messageABIPath, messageABI);

  console.log("ABI files updated with new address:", address);
}

publishPayrollStream();

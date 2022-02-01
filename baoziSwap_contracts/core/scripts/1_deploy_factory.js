const ZERO_ADDRESS = "0x5d4Ca4d8295E644B2a1578e5127eaa9edd544C3E";

async function main() {
    // We get the contract to deploy
    const Greeter = await ethers.getContractFactory("BaoziFactory");
    const greeter = await Greeter.deploy(ZERO_ADDRESS);
  
    console.log("BaoziFactory deployed to:", greeter.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
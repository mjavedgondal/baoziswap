const FACTORY_ADDRESS = "0x7E23f2D3C7Fd061Ad68D72Eb115Aa068BD486E63";
const WETH_ADDRESS = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";

async function main() {
    // We get the contract to deploy
    const Router = await ethers.getContractFactory("BaoziRouter");
    const router = await Router.deploy(FACTORY_ADDRESS, WETH_ADDRESS);
  
    console.log("BaoziRouter deployed to:", router.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
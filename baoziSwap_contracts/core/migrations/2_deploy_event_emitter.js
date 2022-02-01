const BN = require('bn.js');

require('dotenv').config();
const {
} = process.env;

const DeflationaryAutoLPToken = artifacts.require("EventEmitter");

module.exports = async function (deployer, network) {
    if (network == "test" || network == "development")
        return;

    await deployer.deploy(
        DeflationaryAutoLPToken, 
    );


    let DeflationaryAutoLPTokenInst = await DeflationaryAutoLPToken.deployed();
    console.log("Token = ", DeflationaryAutoLPTokenInst.address);
};
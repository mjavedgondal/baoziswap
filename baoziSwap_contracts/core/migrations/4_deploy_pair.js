const BN = require('bn.js');

require('dotenv').config();
const {
} = process.env;

const DeflationaryAutoLPToken = artifacts.require("SafeMoney");

let ADR = "TFVDQruKbfHSsjvHifrff49DobwsxYViBL";

module.exports = async function (deployer, network) {
    if (network == "test" || network == "development")
        return;

    await deployer.deploy(
        DeflationaryAutoLPToken, 
        ADR
    );


    let DeflationaryAutoLPTokenInst = await DeflationaryAutoLPToken.deployed();
    console.log("Token = ", DeflationaryAutoLPTokenInst.address);
};
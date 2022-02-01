const BN = require('bn.js');

require('dotenv').config();
const {
    FEE_TO_SETTER,
    EVENT_EMITTER
} = process.env;

const DeflationaryAutoLPToken = artifacts.require("BaoziFactory");



module.exports = async function (deployer, network) {
    if (network == "test" || network == "development")
        return;

    await deployer.deploy(
        DeflationaryAutoLPToken, 
        FEE_TO_SETTER,
        EVENT_EMITTER
    );


    let DeflationaryAutoLPTokenInst = await DeflationaryAutoLPToken.deployed();
    console.log("Token = ", DeflationaryAutoLPTokenInst.address);
};
const BN = require('bn.js');

require('dotenv').config();
const {
    WTRX
} = process.env;

const Router = artifacts.require("BaoziRouter");
// const WTRX = artifacts.require("WTRX9");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const FACTORY_ADDRESS = "TMhRH7pAikYBuK86kpFdrPboMaUfg7m2wW";
const WTRXinst = "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR";
// const WTRXinst = "TSsj3nsEWiYm81MGzCByjEtGVygh5sRBqd";


module.exports = async function (deployer, network) {
    if (network == "test" || network == "development")
        return;

    // await deployer.deploy(
    //     WTRX
    // );
    // let WTRXinst = await WTRX.deployed();

    await deployer.deploy(
        Router,
        FACTORY_ADDRESS,
        WTRXinst
    );


    let DeflationaryAutoLPTokenInst = await Router.deployed();
    console.log("Token = ", DeflationaryAutoLPTokenInst.address);
};
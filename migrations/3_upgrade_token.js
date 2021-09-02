// migrations/3_upgrade_token.js
/* eslint-disable no-undef */

const OZUToken = artifacts.require('OZUToken');
const OZUTokenV2 = artifacts.require('OZUTokenV2');
// const OZUTokenV3 = artifacts.require('OZUTokenV3');

const { upgradeProxy, } = require('@openzeppelin/truffle-upgrades');

 
module.exports = async function (deployer) {
  const existing = await OZUToken.deployed();
  await upgradeProxy(existing.address, OZUTokenV2, { deployer, });
};
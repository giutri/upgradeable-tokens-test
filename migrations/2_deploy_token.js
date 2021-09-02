// migrations/2_deploy_token.js
/* eslint-disable no-undef */
const web3 = require('web3');

const OZUToken = artifacts.require('OZUToken');
 
const { deployProxy, } = require('@openzeppelin/truffle-upgrades');

const supplyString = '1'+Array(8).fill('000').join('');
const _initialSupply = web3.utils.toBN(supplyString);
const _name = 'Test Token';
const _symbol = 'TST';
 
module.exports = async function (deployer) {
  await deployProxy(OZUToken, [_name, _symbol, _initialSupply], { deployer, initializer: 'initialize', });
};
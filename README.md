# upgradeable-tokens-test
A small unit test for upgradeable EIP-20 compatible tokens using the OpenZeppelin specification

NOTE: Code is provided as is. Repository is not maintained. devDepencencies subject to vulnerability.

To run, ganache-cli must be installed, as well as truffle, both globally.
On debian, ganache-cli may have issues if Node.js is not installed via NVM (node version manager).

## To run:
npm i or npm ci for installing node modules
In one terminal: ganache-cli -p 7545 (port number, can be changed in truffle config)
In another terminal: truffle migrate --reset (will compile as a preliminary step), then run:
truffle test to see unit test results based on locally running node.

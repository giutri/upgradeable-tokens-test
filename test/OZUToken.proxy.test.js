/* eslint-disable no-undef */
const OZUToken = artifacts.require('OZUToken');

const BN = require('bn.js');

require('chai')
    .use(require('chai-bn')(BN))
    .should();

const { deployProxy, } = require('@openzeppelin/truffle-upgrades');


contract('OZUToken (proxy)', (accounts) => {

    const supplyString = '1'+Array(8).fill('000').join('');

    const _initialSupply = web3.utils.toBN(supplyString);
    const _name = 'Test Token';
    const _symbol = 'TST';
    const EXCEEDING_AMOUNT = web3.utils.toBN(supplyString+'0'); // string concat, adds an extra zero so actually 10x

    beforeEach(async () => {
        this.token = await deployProxy(OZUToken, [_name, _symbol, _initialSupply], {initializer: 'initialize',});
    });

    describe('token attributes', () => {

        it('initializes the contract correctly', async () => {
    
            const name = await this.token.name();
            assert.equal(name, _name, 'has the correct token name');
            // name.should.equal(_name)
    
            const symbol = await this.token.symbol();
            assert.equal(symbol, _symbol, 'has the correct token symbol');

            const decimals = await this.token.decimals();
            assert.equal(decimals.toNumber(), 18, 'has the correct token symbol');


        });

        it('initializes the balance correctly', async () => {
    
            const totalSupply = await this.token.totalSupply();
            totalSupply.should.be.a.bignumber.that.equals(_initialSupply);

        });


    });

    describe('token initialization', () => {

        it('mints the entire supply to the admin account upon initialization', async () => {
    
            const adminAddress = accounts[0];
            const adminBalance = await this.token.balanceOf(adminAddress);
            adminBalance.should.be.a.bignumber.that.equals(_initialSupply);

        });
    });

    describe('token ownership transfer', () => {

        it('reverts on a transferring an excessive balance', async () => {
    
            try {
                // using .call calls the function w/o creating the transaction
                await this.token.transfer.call(accounts[1], EXCEEDING_AMOUNT);
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0, 'error message must contain "revert"');
            }
        });

        it('has a TRANSFER event receipt', async () => {

            // no .call, actual transaction, returns a receipt not the functions return value (boolean)
            const receipt = await this.token.transfer(accounts[1], 10, { from: accounts[0], }); 
    
            // // check for receipt properties
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'the event is a "Transfer" event');
            assert.equal(receipt.logs[0].args.from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args.to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args.value, 10, 'logs the transfer amount');
        });

        it('correctly sets balances', async () => {

            const transferAmount = 10;

            const initialSenderBalance = await this.token.balanceOf(accounts[0]);
            const initialRecipientBalance = await this.token.balanceOf(accounts[1]);

            await this.token.transfer(accounts[1], transferAmount, { from: accounts[0], }); 

            const recipientBalance = await this.token.balanceOf(accounts[1]);
            const senderBalance = await this.token.balanceOf(accounts[0]);

            const isBN = new BN(initialSenderBalance);
            const irBN = new BN(initialRecipientBalance);
            const t = new BN(transferAmount);

            const finalSenderBalance = isBN.sub(t);
            const finalRecipientBalance = irBN.add(t);

            recipientBalance.should.be.a.bignumber.that.equals(finalRecipientBalance); // 'adds amount to recipient address'
            senderBalance.should.be.a.bignumber.that.equals(finalSenderBalance); // 'subtracts amount from sender address'

        });

        it('returns a boolean', async () => {

            // assert boolean return
            const success = await this.token.transfer.call(accounts[1], 10, { from: accounts[0], }); 
            assert.equal(success, true, 'transfer call returns a boolean');
        });
    });

    describe('approval for delegated transfer', () => {


        it('sets allowance correctly', async () => {

            await this.token.approve(accounts[1], 5, { from: accounts[0], });

            const allowance = await this.token.allowance(accounts[0], accounts[1]);
            assert.equal(allowance.toNumber(), 5, 'stores the allowance for delegated transfer');
        });

        it('has an APPROVAL event receipt', async () => {

            const receipt = await this.token.approve(accounts[1], 5, { from: accounts[0], });

            // check for receipt properties
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'the event is an "Approval" event');
            assert.equal(receipt.logs[0].args.owner, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args.spender, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args.value, 5, 'logs the transfer amount');
        });

        it('returns a boolean', async () => {
            const success = await this.token.approve.call(accounts[1], 5, { from: accounts[0], });
            assert.equal(success, true, 'approve call returns a boolean');
        });
    });

    describe('modification of allowances', () => {


        it('sets then INCREASES allowance correctly', async () => {

            await this.token.approve(accounts[1], 5, { from: accounts[0], });

            const allowance = await this.token.allowance(accounts[0], accounts[1]);
            assert.equal(allowance.toNumber(), 5, 'stores the allowance for delegated transfer');

            await this.token.increaseAllowance(accounts[1], 5, { from: accounts[0], });

            const newAllowance = await this.token.allowance(accounts[0], accounts[1]);
            assert.equal(newAllowance.toNumber(), 10, 'increments the allowance for delegated transfer');

        });

        it('sets then DECREASES allowance correctly', async () => {

            await this.token.approve(accounts[1], 15, { from: accounts[0], });

            const allowance = await this.token.allowance(accounts[0], accounts[1]);
            assert.equal(allowance.toNumber(), 15, 'stores the allowance for delegated transfer');

            await this.token.decreaseAllowance(accounts[1], 5, { from: accounts[0], });

            const newAllowance = await this.token.allowance(accounts[0], accounts[1]);
            assert.equal(newAllowance.toNumber(), 10, 'decrements the allowance for delegated transfer');

        });

        // it('has an APPROVAL event receipt', async () => {

        //     const receipt = await this.token.approve(accounts[1], 5, { from: accounts[0], });

        //     // check for receipt properties
        //     assert.equal(receipt.logs.length, 1, 'triggers one event');
        //     assert.equal(receipt.logs[0].event, 'Approval', 'the event is an "Approval" event');
        //     assert.equal(receipt.logs[0].args.owner, accounts[0], 'logs the account the tokens are transferred from');
        //     assert.equal(receipt.logs[0].args.spender, accounts[1], 'logs the account the tokens are transferred to');
        //     assert.equal(receipt.logs[0].args.value, 5, 'logs the transfer amount');
        // });

        it('both functions return a boolean', async () => {

            await this.token.approve(accounts[1], 15, { from: accounts[0], });

            const decreaseSuccess = await this.token.decreaseAllowance.call(accounts[1], 5, { from: accounts[0], });
            assert.equal(decreaseSuccess, true, 'decrease allowance call returns a boolean');

            const increaseSuccess = await this.token.increaseAllowance.call(accounts[1], 5, { from: accounts[0], });
            assert.equal(increaseSuccess, true, 'increase allownace call returns a boolean');
        });
    });

    describe('execution of delegated transfer', () => {

        // 1. Setup delegated transfer
        const fromAccount = accounts[2];
        const toAccount = accounts[3];
        const spendingAccount = accounts[4]; //msg.sender

        it('reverts on attempt to transfer a larger amount than senders balance', async () => {

            // Setup: transfer tokens from admin to fromAccount
            await this.token.transfer(fromAccount, 100, { from: accounts[0], });

            // Approve spendingAccount to spend 10 tokens on behalf of fromAccount
            await this.token.approve(spendingAccount, 10, { from: fromAccount, });

            try {
                // using .call calls the function w/o creating the transaction
                await this.token.transferFrom.call(fromAccount, toAccount, EXCEEDING_AMOUNT, { from: spendingAccount, });
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0, 'error message must contain "revert"');
            }
        });

        it('reverts on attempt to transfer an amount larger than what was approved but smalle than the senders balance', async () => {

            await this.token.transfer(fromAccount, 100, { from: accounts[0], });
            await this.token.approve(spendingAccount, 10, { from: fromAccount, });

            try {
                await this.token.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount, });
            } catch (error) {
                assert(error.message.indexOf('revert') >= 0, 'error message must contain "revert"');
            }
        });

        it('has a TRANSFER event receipt', async () => {

            await this.token.transfer(fromAccount, 100, { from: accounts[0], });
            await this.token.approve(spendingAccount, 10, { from: fromAccount, });

            const receipt = await this.token.transferFrom(fromAccount, toAccount, 5, { from: spendingAccount, });

            // console.log('receipt logs is');
            // console.log(receipt.logs);

            // check for receipt properties
            assert.equal(receipt.logs.length, 2, 'triggers one Transfer and one Approval event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'the event is a "Transfer" event');
            assert.equal(receipt.logs[0].args.from, fromAccount, 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args.to, toAccount, 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args.value, 5, 'logs the transfer amount');
        });

        it('correctly sets balances and remaining allowances', async () => {

            await this.token.transfer(fromAccount, 100, { from: accounts[0], });
            await this.token.approve(spendingAccount, 10, { from: fromAccount, });
            await this.token.transferFrom(fromAccount, toAccount, 5, { from: spendingAccount, });

            const recipientBalance = await this.token.balanceOf(toAccount);
            const senderBalance = await this.token.balanceOf(fromAccount);
            assert.equal(recipientBalance.toNumber(), 5, 'adds amount to recipient address');
            assert.equal(senderBalance.toNumber(), 95, 'subtracts amount from sender address');

            const allowance = await this.token.allowance(fromAccount, spendingAccount);
            assert.equal(allowance.toNumber(), 5, 'remaining allowance after delegated transfer');
        });

        it('returns a boolean', async () => {

            await this.token.transfer(fromAccount, 100, { from: accounts[0], });
            await this.token.approve(spendingAccount, 10, { from: fromAccount, });

            const success = await this.token.transferFrom.call(fromAccount, toAccount, 5, { from: spendingAccount, });
            assert.equal(success, true, 'transferFrom call returns a boolean');
        });
    });
});

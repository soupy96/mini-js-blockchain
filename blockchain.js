// import the the sha256 library to create hashes for each block in the blockchain
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// creating a class for the transaction
class Transaction {
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

// this is what a block on the blockchain looks like
class Block{
    // the properties of each block
    // previousHash is the hash of the block before the current block in the blockchain, this is for integrity
    // adding a property called nonce to change the block, random number that has nothing to do with the block but can be changed to any random number
    // changed the data field to recieve transactions
    // removed index because the order of the blocks is the postition of said block in the blockchain
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    // calculates the hash of the block with the blocks properties and returns a string
    calculateHash(){
        // adds the nonce to the creation of the hash
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    // mines the next block
    // this creates and increases the difficulty for each new block that is mined. adds a certain amount of zeros to the beginning of the has based on the difficulty
    mineBlock(difficulty){
        // substring adds the certain amount of zeros to the beginning of the hash based on the difficulty
        // compares it to the array with the same amount of zeros
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        // outputs the hash of the block that is just mined
        console.log("Block mined: " + this.hash);
    }

    hasValidTransactions() {
        for(const tx of this.transactions){
            if(!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}

// creates a new block in the blockchain
class Blockchain{
    // this is the array of blocks which represent the blockchain which creates the very first block in the blockchain, the genesis block. any other blocks that are going to be made are appened to this array
    // added the difficulty here for future reasons
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    // the first block in the blockchain
    createGenesisBlock(){
        // previousHash is 0
        // removed the index from the genesis block
        return new Block("01/01/2017", "Genesis block", "0"); 
    }

    // returns the latest block in the Blockchain
    getLatestBlock(){
        return this.chain[this.chain.length - 1]
    }

    // replaced the addBlock method with the minePendingTransactions method
    // takes the miners address so that if they successfully mine the block the reward gets sent to the miners address
    // add pending transactions will be kept in the pendingTransactions array and be "posted" until this block is "done" and the new block "begins". just like how BTC finishes a block every ten minutes
    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        // because a block cannot exceed 1mb the miners can choose which transactions they want to include but for this example we are going to include all of them
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        // mines the block with the difficulty
        block.mineBlock(this.difficulty);

        console.log("Block Successfully Mined!");
        // push the block to the blockchain
        this.chain.push(block);

        // resets the pending transactions
        this.pendingTransactions = [];
    }

    // this will recieve the transactions and add it to the pendingTransactions array
    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    // people think that when you complete a transaction BTC moves from one wallet to another. 
    // there is no balance in your actual wallet.
    // the transactions for your address are stored on the blocks in the blockchain
    // once you ask for your address's balance it goes through all the transactions that involve your adress across all blocks on the blockchains and then calculates your balance
    getBalanceOfAddress(address){
        let balance = 0;

        // loops through every block on the blockchain
        for(const block of this.chain){
            // loops through every transaction on said block on the blockchain
            for(const trans of block.transactions){
                // if you are sending coins away from your address
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                // if you are recieving coins on your address
                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        // returns the balance on your address
        return balance;
    }

    // returns true if the blockchain is valid or false if something is wrong
    isChainValid(){
        // loops through the blockchain
        // starts with the block after the genesis block which is why i starts at 1 instead of 0
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            // the actual hash of the block doesnt match up with what the property says
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            // checks to see if the previousHash is the correct previousHash
            if(currentBlock.previousHash !== previousBlock.calculateHash()){
                return false;
            }
        }

        // returns true if the blockchain is valid
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
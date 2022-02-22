// to run open up the console and type 'node main.js'

// import the the sha256 library to create hashes for each block in the blockchain
const SHA256 = require('crypto-js/sha256');

// this is what a block on the blockchain looks like
class Block{
    // the properties of each block
    // data is the information of the transcation ex: how much was transfered and the people involved in it
    // previousHash is the hash of the block before the current block in the blockchain, this is for integrity
    constructor(index, timestamp, data, previousHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    // calculates the hash of the block with the blocks properties and returns a string
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }
}

// creates a new block in the blockchain
class Blockchain{
    constructor(){
        // this is the array of blocks which represent the blockchain which creates the very first block in the blockchain, the genesis block. any other blocks that are going to be made are appened to this array
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;
    }

    // the first block in the blockchain
    createGenesisBlock(){
        // previousHash is 0
        return new Block(0, "01/01/2017", "Genesis block", "0"); 
    }

    // returns the latest block in the Blockchain
    getLatestBlock(){
        return this.chain[this.chain.length - 1]
    }

    // creating a new block to be added into the blockchain
    addBlock(newBlock){
        // sets the previousHash to the latest block is the blockchain hash
        newBlock.previousHash = this.getLatestBlock().hash;
        // 
        newBlock.mineBlock(this.difficulty);
        // creates a new block in the blockchain whenever some properties are changed in the block
        // newBlock.hash = newBlock.calculateHash();
        // pushs the newest block that was just made to the blockchain
        this.chain.push(newBlock);
    }

    // returns true if the blockchain is valid or false if something is wrong
    isChainValid(){
        // loops through the blockchain
        // starts with the block after the genesis block which is why i starts at 1 instead of 0
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // the actual hash of the block doesnt match up with what the property says
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            // checks to see if the previousHash is the correct previousHash
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        // returns true if the blockchain is valid
        return true;
    }
}

// the instance of the new blockchain
let mikeCoin = new Blockchain();

console.log('Mining Block 1...');
// creates a block: the index, timestamp, and the data object with all the details of the block
mikeCoin.addBlock(new Block(1, "10/07/2017", {amount: 4}));

console.log('Mining Block 2...');
// creates a block: the index, timestamp, and the data object with all the details of the block
mikeCoin.addBlock(new Block(2, "12/07/2017", {amount: 10}));

// prints the blockchain with the new blocks added above
// console.log(JSON.stringify(mikeCoin, null, 4));

// returns true
// console.log('Is blockchain valid? ' + mikeCoin.isChainValid());

// try to change the amount of coins transfered on the first block, returns false
// mikeCoin.chain[1].data = { amount: 100 };
// try to change the hash on the first blocks hash, returns false
// mikeCoin.chain[1].hash = mikeCoin.chain[1].calculateHash();

// returns false because we have tried to change the block/blockchain
// console.log('Is blockchain valid? ' + mikeCoin.isChainValid());

// console.log(JSON.stringify(mikeCoin, null, 4));

// to run open up the console and type 'node main.js'
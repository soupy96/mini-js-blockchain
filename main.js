// import the the sha256 library to create hashes for each block in the blockchain
const SHA256 = require('crypto-js/sha256');

// creating a class for the transaction
class Transaction {
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

// this is what a block on the blockchain looks like
class Block{
    // the properties of each block
    // data is the information of the transcation ex: how much was transfered and the people involved in it
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
        // because a block cannot exceed 1mb the miners can choose which transactions they want to include but for this example we are going to include all of them
        let block = new Block(Date.now(), this.pendingTransactions);
        // mines the block with the difficulty
        block.mineBlock(this.difficulty);

        console.log("Block Successfully Mined!");
        // push the block to the blockchain
        this.chain.push(block);

        // resets the pending transactions
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    // this will recieve the transactions and add it to the pendingTransactions array
    createTransaction(transaction){
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

// creates transactions with the fromAddress, toAddress and the amount
// address1 and address2 in reality would be the public key of someones wallet
mikeCoin.createTransaction(new Transaction('address1', 'address2', 100));
mikeCoin.createTransaction(new Transaction('address2', 'address1', 50));

// we have created the transactions above and put them in pendingTransactions array
// starts the miner and creates a block and stores the transaction on said current block
console.log('\n Starting the miner...');
// the address is where the mining reward will be sent to
mikeCoin.minePendingTransactions('jamie-address');
console.log('\n Balance of Jamie is', mikeCoin.getBalanceOfAddress('jamie-address'));
// the above console log with print out the balance of 0. 
// after a block has been mined we create a new transaction to give you your mining reward but it is added to the pendingTransactions array
// so the mining reward will only be sent when the next block is mined. hence finishing the block and starting a new block

console.log('\n Starting the miner again...');
mikeCoin.minePendingTransactions('jamie-address');
console.log('\n Balance of Jamie is', mikeCoin.getBalanceOfAddress('jamie-address'));
// this will print out a balance of 100
// while mining a second block we get a new reward which will be sent to us when the next block is mined

// to run open up the console and type 'node main.js'
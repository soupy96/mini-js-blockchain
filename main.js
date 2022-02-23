const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('56da7ca6b652519f47dfc7ca45dca98804350175f38e9bc886c597a7682d7ee7');
const myWalletAddress = myKey.getPublic('hex');

// the instance of the new blockchain
let mikeCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
mikeCoin.addTransaction(tx1);

// we have created the transactions above and put them in pendingTransactions array
// starts the miner and creates a block and stores the transaction on said current block
console.log('\n Starting the miner...');
// the address is where the mining reward will be sent to
mikeCoin.minePendingTransactions(myWalletAddress);
console.log('\n Balance of Jamie is', mikeCoin.getBalanceOfAddress(myWalletAddress));
// the above console log with print out the balance of 0. 
// after a block has been mined we create a new transaction to give you your mining reward but it is added to the pendingTransactions array
// so the mining reward will only be sent when the next block is mined. hence finishing the block and starting a new block

mikeCoin.chain[1].transactions[0].amount = 1;

console.log('Is chain valid?', mikeCoin.isChainValid());

// to run open up the console and type 'node main.js'
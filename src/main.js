// importing classes from blockchain.js
const {Blockchain, Transaction} = require('./blockchain');
// this library allows the creation of private and public keys as well as methods to sign and verify signatures
const EC = require('elliptic').ec;
// this is the same algorithm for BTC wallets
const ec = new EC('secp256k1');

// private key hash
const myKey = ec.keyFromPrivate('833131978a1b8fcb3dd1f85ecc87d19cca9d44dcbcd42b333065e3d4b0b3caab');
// the public key or wallet address
const myWalletAddress = myKey.getPublic('hex');

// the instance of the new blockchain
const mikeCoin = new Blockchain();

// transaction from my wallet to another wallet or public key
const tx1 = new Transaction(myWalletAddress, 'address2', 10);
// sign the transaction
tx1.signTransaction(myKey);
// after its signed add it to the blockchain
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

// trying to tamper with the transactions
mikeCoin.chain[1].transactions[0].amount = 10;

console.log('Is chain valid?', mikeCoin.isChainValid() ? 'Yes' : 'No');

// to run open up the console and type 'node main.js'
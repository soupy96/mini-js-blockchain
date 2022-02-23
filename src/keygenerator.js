// this library allows the creation of private and public keys as well as methods to sign and verify signatures
const EC = require('elliptic').ec;
// this is the same algorithm for BTC wallets
const ec = new EC('secp256k1');

// creates key pair
const key = ec.genKeyPair();
// makes public key
const publicKey = key.getPublic('hex');
// makes private key
const privateKey = key.getPrivate('hex');

// shows public key on console
console.log();
console.log('Your public key (also your wallet address, freely shareable)\n', publicKey);

// shows private key on console
console.log();
console.log('Your private key (keep this secret! To sign transactions)\n', privateKey); 
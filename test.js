const Blockchain = require('./dev/blockchain');
const digitalID = new Blockchain();

const bc1 =
{
"chain": [
{
"index": 1,
"timestamp": 1614249274468,
"Transactions": [],
"nonce": 100,
"hash": "0",
"previousBlockHash": "0"
},
{
"index": 2,
"timestamp": 1614249369941,
"Transactions": [
{
"fullName": "Yeoh Yong Ze",
"username": "jeffyeoh99",
"email": "jeffyeoh99@gmail.com",
"icNo": "990101010101",
"address": "Jalan Ipoh",
"password": "12345678",
"transactionID": "43e7ead0775511ebb1a1710b97786ee1"
}
],
"nonce": 47131,
"hash": "0000347b3a831d4fc3f732bae14ce25f7d1ac88a9e13431c354bb7b3c9260c85",
"previousBlockHash": "0"
},
{
"index": 3,
"timestamp": 1614249370500,
"Transactions": [],
"nonce": 15402,
"hash": "0000a4e1c7cd3d5bc394462e16eb73d63580ac537bb495a26a7c2a4a80652f6d",
"previousBlockHash": "0000347b3a831d4fc3f732bae14ce25f7d1ac88a9e13431c354bb7b3c9260c85"
}
],
"pendingTransactions": [],
"currentNodeUrl": "http://localhost:3001",
"networkNodes": []
}

console.log(bc1);
console.log(bc1.chain);
console.log('VALID:', digitalID.chainIsValid(bc1.chain));
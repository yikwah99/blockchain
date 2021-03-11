const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
//const uuid = require('uuid/v1');
const {v1: uuidv1} = require ('uuid');

function Blockchain () {
  this.chain = [];
  this.pendingTransactions = [];
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash){
    const newBlock = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      Transactions: this.pendingTransactions,
      nonce: nonce,
      hash: hash,
      previousBlockHash: previousBlockHash,
    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
  }
  Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length-1];
  }
  Blockchain.prototype.createNewTransaction = function(fullName, username, email, icNo, address, password){
    const newTransaction = {
      fullName: fullName, 
      username: username, 
      email: email, 
      icNo: icNo, 
      address: address,
      password: password,
      transactionID: uuidv1().split('-').join('')
    };
    return newTransaction;
    //this.pendingTransactions.push(newTransaction);
    //return this.getLastBlock()['index']+1;
  }
  
  Blockchain.prototype.addTransactionToPendingTransactions = function(newTransaction){
    this.pendingTransactions.push(newTransaction);
    return this.getLastBlock()['index']+1;
  }
  
  Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData,nonce){
    const dataAsString =previousBlockHash +nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
  }
  Blockchain.prototype.proofOfWork = function(previousBlockHash,currentBlockData){
    let nonce=0;
    let hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
    while (hash.substring(0,4)!=='0000'){
      nonce ++;
      hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
    }
    return nonce;
  }
  /*
  Blockchain.prototype.chainIsValid = function (blockchain){
    let validChain = true;
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock.Transactions.length === 0 ;
    for (var i = 1; i<blockchain.length; i++){
      const currentBlock = blockchain [i];
      const prevBlock = blockchain [i-1];
      const blockHash = this.hashBlock (prevBlock['hash'],  currentBlock['transactions'], currentBlock['nonce']);
      console.log(prevBlock['hash']);
      console.log({ transactions: currentBlock['transactions'], index: currentBlock['index'] });
      console.log(currentBlock['nonce']);
      if (blockHash.substring(0,4)!== '0000'){
        console.log(blockHash);
        console.log("1");
        validChain = false;
      }
      if (prevBlock.hash !== currentBlock.previousBlockHash){
        validChain = false;
        console.log("2");
      }
      if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions){
        validChain = false;
        console.log("3");
      } 
    };
    
    return validChain;
    
  }
  
  Blockchain.prototype.chainIsValid = function(blockchain) {
    let validChain = true; 
    const blockHash = this.hashBlock (prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] } currentBlock['nonce']);
    for (var i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i];
      const prevBlock = blockchain[i - 1];
      const blockHash = this.hashBlock ();
      if (currentBlock['previousBlockHash'] !==
      prevBlock['hash']) validChain = false;
      if (blockHash.substring(0, 4) !== '0000') validChain = false;

    };  
    return validChain;
}; */
  this.createNewBlock(100,'0','0');
}

module.exports = Blockchain;



const port = process.argv[2];
const currentNodeUrl = process.argv[3];
const express = require ('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const { v1: uuid } = require('uuid');
const rp = require('request-promise');
const digitalID = new Blockchain();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.get('/blockchain',function(req,res){
  res.send(digitalID);
});

/* app.post('/transaction',function(req,res){
  const blockIndex = digitalID.createNewTransaction(req.body.fullName,req.body.username, req.body.email,req.body.icNo,req.body.address,req.body.password);
  res.json({ note:`Transaction will be added in block ${blockIndex}.`});

}); */

app.post('/transaction', function(req,res){
  const newTransaction = req.body;
  const blockIndex = digitalID.addTransactionToPendingTransactions(newTransaction);
  res.json({note: `Transaction will be added in block ${blockIndex}.`})
});
// broadcast a new transaction created in current node to other nodes in the network
app.post('/transaction/broadcast',function(req,res){
  const newTransaction = digitalID.createNewTransaction(req.body.fullName, req.body.username, req.body.email, req.body.icNo, req.body.address, req.body.password);
  const requestPromises =[];
  digitalID.addTransactionToPendingTransactions(newTransaction);
  digitalID.networkNodes.forEach(networkNodeUrl=>{
    const requestOptions = {
      uri: networkNodeUrl + '/transaction',
      method: 'POST',
      body: newTransaction,
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises)
  .then(data =>{
     res.json({ note: 'Transaction created and broadcast successfully.'})   
  });
})

// add all pending transactions into a new block and mine
app.get('/mine',function(req,res){
  const lastBlock = digitalID.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    Transactions: digitalID.pendingTransactions,
    index: lastBlock['index'] + 1
  }
  const nonce = digitalID.proofOfWork(previousBlockHash,currentBlockData);
  const hash = digitalID.hashBlock(previousBlockHash,currentBlockData,nonce);
  const newBlock = digitalID.createNewBlock(nonce,previousBlockHash,hash);
  console.log(newBlock);
  const requestPromises = [];
  digitalID.networkNodes.forEach(networkNodeUrl=>{
    const requestOptions = {
      uri: networkNodeUrl + '/receive-new-block',
      method: 'POST',
      body: { newBlock: newBlock },
      json: true
    };
    requestPromises.push(rp(requestOptions));
  })
  Promise.all(requestPromises)
  .then(data =>{
   res.json({ note: 'New block is broadcasted successfully.'})  
  });
  
});

// receive a new block mined by another node
app.post('/receive-new-block', function(req,res){
  const newBlock = req.body.newBlock;
  console.log(newBlock);
  const lastBlock = digitalID.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
  console.log(lastBlock.hash);
  console.log(newBlock.previousBlockHash);
  console.log(correctHash);
  if (correctHash && correctIndex){
    digitalID.chain.push(newBlock);
    digitalID.pendingTransactions = [];
    res.json({
      note: 'New block received and accepted.',
      newBlock: newBlock
    })
  }
  else{
    res.json({
      note:'New block rejected.',
      newBlock: newBlock
    });
  }
}); 


// register a node with the network
app.post('/register-node', function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = 
    digitalID.networkNodes.indexOf(newNodeUrl) == -1; 
  const notCurrentNode = digitalID.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode )
    digitalID.networkNodes.push(newNodeUrl);
  res.json({ note: 'New node registered successfully.' }); 
});

// register all the existing nodes in the network into the new node's network
app.post('/register-nodes-bulk', function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => { 
    const notCurrentNode = digitalID.currentNodeUrl!==networkNodeUrl;
    const nodeNotAlreadyPresent = digitalID.networkNodes.indexOf(networkNodeUrl) == -1;
    if(nodeNotAlreadyPresent && notCurrentNode)
      digitalID.networkNodes.push(networkNodeUrl);
  });
  res.json({note: 'Bulk registration successful.' });
});

// to call register-node on every existing nodes and register existing nodes into new node's network
app.post('/register-and-broadcast-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const regNodesPromises = [];
  if (digitalID.networkNodes.indexOf(newNodeUrl) == -1)
    digitalID.networkNodes.push(newNodeUrl); 
  digitalID.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/register-node', 
      method: 'POST',
      body: { newNodeUrl: newNodeUrl },
      json: true
    };
    regNodesPromises.push(rp(requestOptions));
  });
  Promise.all(regNodesPromises)
  .then(data => {
    const bulkRegisterOptions = { 
        uri: newNodeUrl + '/register-nodes-bulk',  
        method: 'POST',
        body: {allNetworkNodes: [...digitalID.networkNodes,
        digitalID.currentNodeUrl]} ,
        json:true
    };  
    return rp(bulkRegisterOptions).then (data => {
      res.json({ note: 'New Node registered with network successfully' });
    })
  });
});

app.listen(port, function(){
  console.log(`listening on port ${port}...`);
});
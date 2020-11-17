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
app.post('/transaction',function(req,res){
  const blockIndex = digitalID.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
  res.json({ note:`Transaction will be added in block ${blockIndex}.`});

});
app.get('/mine',function(req,res){
  const lastBlock = digitalID.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    Transactions: digitalID.pendingTransactions,
    index: lastBlock['index'] + 1
  }
  const nonce = digitalID.proofOfWork(previousBlockHash,currentBlockData);
  const hash = digitalID.hashBlock(previousBlockHash,currentBlockData,nonce);
  const nodeAddress = uuid().split('-').join('');
  const newBlock = digitalID.createNewBlock(nonce,previousBlockHash,hash);
  res.json({note:"New block mined successfully",
           block: newBlock
           });
  
});
app.post('/register-and-broadcast-node', (req,res) =>{
  const newNodeUrl = req.body.newNodeUrl;
  const notCurrentNode = digitalID.currentNodeUrl !== newNodeUrl;
  if(digitalID.networkNodes.indexOf(newNodeUrl) == -1 && notCurrentNode)
    digitalID.networkNodes.push(newNodeUrl);

  const regNodesPromises = [];
  digitalID.networkNodes.forEach(networkNodesUrl => {
    const requestOptions = {
      uri: networkNodesUrl + "/register-node",
      method: "POST",
      body: { 
          newNodeUrl: newNodeUrl
      },
      json: true
    }
    //rp(requestOptions)
    regNodesPromises.push(rp(requestOptions));
  })
  console.log(regNodesPromises);
  Promise.all(regNodesPromises)
    .then(data => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: {
            allNetworkNodes: [...digitalID.networkNodes,digitalID.currentNodeUrl]
        },
        json: true
      }
      console.log("test");
      return rp(bulkRegisterOptions)
        .then(data => {
          res.json({
              note: "New Node registered with network successfully"
          });
        })
      .catch(function (error){
        res.json({
          error: error
        });
      });
    })
  .catch(function (error){
    res.json({
      error: error
    });
  });
});
app.post('/register-node',
        function(req,res){
  const newNodeUrl = req.body.newNodeUrl;
  if (digitalID.networkNodes.indexOf(newNodeUrl) == -1 && digitalID.currentNodeUrl !== newNodeUrl){
    digitalID.networkNodes.push(newNodeUrl);
    res.json({note: 'New node registered sucessfully.'});
  }
  
});
app.post('/register-nodes-bulk',
        function(req,res){
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl=>{
    if(digitalID.networkNodes.indexOf(networkNodeUrl) == -1 && digitalID.currentNodeUrl!==networkNodeUrl){
      digitalID.networkNodes.push(networkNodeUrl);
    }
  });
  res.json({note:'Bulk registration successful.'})
  
});
app.post('/transaction/broadcast', function(req,res){
  const newTransaction = digitalID.createNewTransaction(req.body.amount, req.body.sender,req.body.recipient);
})
app.listen(port, function(){
  console.log(`listening on port ${port}...`);
});
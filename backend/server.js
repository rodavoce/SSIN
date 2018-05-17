const express = require('express');
const app = express();
const port = 3001;
const driver = require('bigchaindb-driver');


const PromiseA = require('bluebird').Promise;
const fs = PromiseA.promisifyAll(require('fs'));
const path = require('path');
const ursa = require('ursa');
const mkdirpAsync = PromiseA.promisify(require('mkdirp'));
const pathname = 'serverkeys'


const alice = new driver.Ed25519Keypair();
const conn = new driver.Connection(
    'https://test.bigchaindb.com/api/v1/',
    {
        app_id: 'af2e016d',
        app_key: '405c9c673ddcf8a68807dbc4c45ef5e1'
    });

app.get('/' , (request, response) => {
    response.send('Server is online');
});

app
    .post('/timestamp' , (request, response) => {
        //TODO

        //Receive file
        //checkIfSigned?


        response.send('Server is online');
    });

app
    .post('/verify' , (request, response) => {
        //TODO
        response.send('Server is online');
    });


app.listen(port, (err) =>  {
    if(err) {
        return console.log('maybe the port isnt avaiable');
   }

    console.log("server is listening on port " + port)
});


const sendToDB = function () {

        const createTransaction = function (message) {
            const tx = driver.Transaction.makeCreateTransaction(
                { message: 'testmessage' },
                null,
                [ driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(alice.publicKey))],
                alice.publicKey)
            const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey)
        };

        const sendTransaction = function (txSigned) {
            conn.postTransactionCommit(txSigned)
        };
};

const searchOnDB = function () {
    conn.searchAssets('testmessage')
        .then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets));
};



const timestamp = function (hash) {
    const moment = require('moment');

    //getcurrentTimestamp
    const now = moment();
    console.log(now)
    

    //calculate hash(hash + timestamp)
    //sign with private key

    //store on DB

    //send hash + timestamp

};


const verifyTimestamp  = function (signature) {
    var privkeyServer = ursa.createPrivateKey(fs.readFileSync('./'+ pathname +'/privkey.pem'));
    var pubkeyServer = ursa.createPublicKey(fs.readFileSync('./'+ pathname +'/pubkey.pem'));

    var msg = "IT’S A SECRET TO EVERYBODY.";
    var sig;
    var enc;
    enc = pubkeyServer.encrypt(msg, 'utf8', 'base64');
    sig = privkeyServer.hashAndSign('sha256', msg, 'utf8', 'base64'); //é este que vamos querer fazer aqui
    console.log('encrypted', enc, '\n');
    console.log('signed', sig, '\n');

    //apply public key over signature
    //should match the received one
};


if (fs.existsSync(pathname)){
    console.log('keys were previously created');
} 
else  {
PromiseA.all([
    setkey('serverkeys')    
  ]).then(function (keys) {
    console.log('generated %d keypairs', keys.length);
  }); 
}  
 


function setkey(pathname) {
    const key = ursa.generatePrivateKey(1024, 65537);
    const privpem = key.toPrivatePem();
    const pubpem = key.toPublicPem();
    const privkey = path.join(pathname, 'privkey.pem');
    const pubkey = path.join(pathname, 'pubkey.pem');;

        return mkdirpAsync(pathname).then(function () {
            return PromiseA.all([
              fs.writeFileAsync(privkey, privpem, 'ascii')
            , fs.writeFileAsync(pubkey, pubpem, 'ascii')
            ]);
          }).then(function () {
            return key;
          });
  };


verifyTimestamp("asdsad");
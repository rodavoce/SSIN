const express = require('express');
const app = express();
const port = 3001;
const busboy = require('connect-busboy');
const fs = require('fs');


const driver = require('bigchaindb-driver');
const alice = new driver.Ed25519Keypair();
const conn = new driver.Connection(
    'https://test.bigchaindb.com/api/v1/',
    {
        app_id: 'af2e016d',
        app_key: '405c9c673ddcf8a68807dbc4c45ef5e1'
    });



const crypto = require('crypto');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Allow-Headers", "access-control-allow-origin");
    next();
});

app.use(busboy({
    limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024
    }
}));

app
    .get('/' , (request, response) => {
        response.send('Server is online');
    });

app
    .post('/timestamp' , (request, response) => {

        let fstream;

        request.pipe(request.busboy);
        request.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename );

            fstream = fs.createWriteStream("./"+filename);


            file.on('limit', function () {
                response.status(403).send("File is too big");
            });

            file.on('data', function (chunk) {
                fstream.write(chunk);
            });

            file.on('end', function () {
                fstream.close();
            });

            fstream.on('close', function () {
                timestamp("qweqweqweqeq", function (err, result) {  //TODO hardcoded
                    if(err)
                    {

                        response.status(500).send("Internal server error");
                    }
                    else
                    {
                        response.send(result);
                    }
                });

            });

            fstream.on('error', function () {
                response.status(500).send("piping file error");
            });

        })
    });

app
    .post('/verify' , (request, response) => {
        //TODO
        response.send('Server is online');
    });


app
    .listen(port, (err) =>  {
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



const timestamp = function (hash, callback) {
    const moment = require('moment');

    //getcurrentTimestamp
    const now = moment();
    //calculate hash(hash + timestamp)
    const data = hash + now.toString();
    const hashedData =  crypto.createHash('sha256').update(hash).digest("base64");

    //sign with private key

    //store on DB

    //sendToDB()


    //send hash + timestamp

    console.log("Timestamp: " + now);
    console.log("hash + timestamp: " + hashedData);



    callback(null,hashedData);
};


const verifyTimestamp  = function (signature) {
    //apply public key over signature

    //checkStored signature ( check date )

    //should match the received one
    //send response accordly
};









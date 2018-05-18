const express = require('express');
const app = express();
const https = require('https');
const port = 3001;
const host = 'localhost';
const busboy = require('connect-busboy');
const fs = require('fs');

//Load Certificate and private key
const privatekey = fs.readFileSync('sslcert/server.key');
const certificate = fs.readFileSync('sslcert/server.crt');
const credentials = {key: privatekey, cert: certificate};

const ursa = require('ursa');
const key = ursa.createPrivateKey(privatekey); 


const crypto = require('crypto');


//DB
const driver = require('bigchaindb-driver');
const conn = new driver.Connection(
    'https://test.bigchaindb.com/api/v1/',
    {
        app_id: 'af2e016d',
        app_key: '405c9c673ddcf8a68807dbc4c45ef5e1'
    });


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST");
    res.header("Access-Control-Allow-Headers", "access-control-allow-origin");
    next();
});

app.use(busboy({
    limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024 //10mb
    }
}));

//setup server
app.listen(3002);
const server = https.createServer(credentials, app);
server.listen(port,host);
console.log("https server listining on %s:%s", host, port);





app.get('/' , (request, response) => {
    response.send('Server is online');
});

app.post('/timestamp' , (request, response) => {

    let fstream;

    request.pipe(request.busboy);
    request.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename );

        const localPath = "./tempFileStorage/"+filename;

        fstream = fs.createWriteStream(localPath);

        file.on('limit', function () {
            response.status(403).send("File is too big");
            fstream.close();
        });

        file.on('data', function (chunk) {
            fstream.write(chunk);
        });

        file.on('end', function () {
            fstream.close();
        });

        fstream.on('close', function () {

            const readFile = fs.readFile(localPath, function (err, data) {
                if(err)
                {
                    response.status(500).send("error while loading file from local storage")
                }
                else
                {
                    timestamp(data, function (err, result) {
                        if(err)
                        {
                            response.status(500).send("Internal server error");
                        }
                        else
                        {
                            response.send(JSON.stringify({ hash: result })); //respond with a stamp
                        }

                    });
                }
            });
        });

        fstream.on('error', function () {
            response.status(500).send("piping file error");
        });

    })
});

app.post('/verify' , (request, response) => {
    //TODO
    response.send('Server is online');
});





const sendToDB = function (hash) {

    const pair = new driver.Ed25519Keypair();
    const tx = driver.Transaction.makeCreateTransaction(
        { hash: hash },
        null,
        [ driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(pair.publicKey))],
        pair.publicKey)
    const txSigned = driver.Transaction.signTransaction(tx, pair.privateKey)
    conn.postTransactionCommit(txSigned);

    console.log(txSigned.id);

};

const searchOnDB = function (data, callback) {
    conn.searchAssets(data)
        .then(assets => callback(assets));
};



const timestamp = function (data, callback) {
    const moment = require('moment');
    //getcurrentTimestamp
    const now = moment();

    //hash file content
    let hashedData =  crypto.createHash('sha256').update(data).digest("base64");

    //calculate hash(hash + timestamp)
    hashedData =  crypto.createHash('sha256').update(hashedData + now.toString()).digest("base64");

    const stamp = {
        hash: hashedData,
        timestamp: now
    };

    //encrypt with private key
    const signed = key.privateEncrypt(JSON.stringify(stamp), 'utf8', 'base64');

    //store on DB

    sendToDB(signed);

    console.log("Timestamp: " + now);
    console.log("hash + timestamp: " + hashedData);
    console.log("encrypt with private key: " + signed);


    return callback(null, signed);
};


const verifyTimestamp  = function (signature, data, callback) {


    //apply public key over signature
    const signed = " "; // publickey.decrypt(signature, 'utf8' , 'base64');

    //hash file content
    let hashedData =  crypto.createHash('sha256').update(data).digest("base64");





        searchOnDB(signature, function (results) {
            if(results.length < 1)
            {
                //forged stamp
            }
            else
            {
                const timestamp = results[0]; //TODO need publickey
                //calculate hash(hash + timestamp)
                hashedData =  crypto.createHash('sha256').update(hashedData + timestamp).digest("base64");


                if(hashedData === signed)
                {
                    //ok
                }
                else
                {
                    // modified file?
                }
            }
        })


};









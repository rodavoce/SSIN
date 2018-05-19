const express = require('express');
const app = express();
const https = require('https');
const port = 3001;
const host = 'localhost';
const busboy = require('connect-busboy');
const PromiseA = require('bluebird').Promise;
const fs = PromiseA.promisifyAll(require('fs'));
const async = require('async');

//Load Certificate and private key
const privatekey = fs.readFileSync('sslcert/server.key');
const certificate = fs.readFileSync('sslcert/server.crt');
const credentials = {key: privatekey, cert: certificate};

const ursa = require('ursa');



const crypto = require('crypto');


const path = require('path');
const mkdirpAsync = PromiseA.promisify(require('mkdirp'));
const pathname = 'serverkeys';

let privkeyServer;
let pubkeyServer;

const startkeys  = function () {
    privkeyServer = ursa.createPrivateKey(fs.readFileSync('./'+ pathname +'/privkey.pem'));
    pubkeyServer = ursa.createPublicKey(fs.readFileSync('./'+ pathname +'/pubkey.pem'));


    //test

    const msg = "test";

    const test = privkeyServer.privateEncrypt(msg, 'utf8', 'base64');
    const test2= pubkeyServer.publicDecrypt(test,'base64','utf8');




};



if (fs.existsSync(pathname)){
    console.log('keys were previously created');
    startkeys();
}
else  {
    PromiseA.all([
        setkey('./serverkeys/')
    ]).then(function (keys) {
        console.log('generated %d keypairs', keys.length);
        startkeys();
    });
}

function setkey(pathname) {
    const key = ursa.generatePrivateKey(2048, 65537);
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
        files: 2,
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

            fs.readFile(localPath, function (err, data) {
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
                            response.send(JSON.stringify(result)); //respond with a stamp
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


    let fstream;

    let files = [];

    request.pipe(request.busboy);
    request.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename );

        const localPath = "./tempFileStorage/"+filename;
        files.push(localPath);

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

        });

        fstream.on('error', function () {
            response.status(500).send("piping file error");
        });

    });

    request.busboy.on('finish' , function  () {
        if(files.length === 2) {
            let dataReceived, stamp;

            async.each(
                files,
                function (filepath, cb) {

                    if(filepath.indexOf('.stamp') > -1)
                    {
                        console.log("1");
                        fs.readFile(filepath, function (err, data) {
                            if (err) {
                                return cb(500,"error while loading file from local storage")
                            }
                            else
                            {
                                stamp = data;
                                cb(null);
                            }
                        });
                    }
                    else
                    {
                        console.log("2");
                        fs.readFile(filepath, function (err, data) {
                            if (err) {
                                cb(500,"error while loading file from local storage");
                            }
                            else
                            {
                                dataReceived = data;
                                cb(null);
                            }
                        });
                    }
                },
                function (err, msg) {
                    if(err){
                        return response.status(err).send(msg);
                    }
                    else {
                        if(!(dataReceived) || !(stamp))
                            return response.status(403).send("invalid request");

                        verifyTimestamp(stamp,dataReceived, function (status, msg) {
                            return  response.status(status).send(msg);
                        })
                    }
                }
            );
        }
        else
        {
            return response.status(403).send("invalid number of files");
        }
    });

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
        hash: privkeyServer.privateEncrypt(hashedData, 'utf8', 'base64'),
        timestamp: now.toString(),
    };

    //store on DB

    sendToDB(stamp);

    console.log("Timestamp: " + now.toString());
    console.log("hash + timestamp: " + hashedData);
    console.log("stamp : " + stamp.hash + " " + stamp.timestamp );

    return callback(null, stamp);
};


const verifyTimestamp  = function (signature, data, callback) {
    //apply public key over signature
    const receivedStamp = JSON.parse(signature);

    const unsigned = pubkeyServer.publicDecrypt(receivedStamp.hash,'base64','utf8');


    searchOnDB(receivedStamp.hash, function (results) {
        if(results.length < 1)
        {
            return callback(403, "forged stamp");
        }
        else
        {
            console.log(results[0].data.hash.hash);
            //hash file content
            let hashedData =  crypto.createHash('sha256').update(data).digest("base64");


            const timestamp = receivedStamp.timestamp;

            console.log("timeStamp: " + timestamp);

            //calculate hash(hash + timestamp)
            hashedData =  crypto.createHash('sha256').update(hashedData + timestamp).digest("base64");

            console.log(receivedStamp.hash);
            console.log("");
            console.log(hashedData);
            console.log("");
            console.log(unsigned);
            if(hashedData.toString() === unsigned)
            {
                callback(200,"OK matched");
            }
            else
            {
                callback(403, "File and stamp dont match");
            }
        }
    })


};










const settings = require('./../wallets/all_settings');
const db = require('./../database/db');
const fs = require('fs-extra');
const spawn = require('child_process').spawn;

var wallet = process.argv[2];

if(!wallet) {
    console.log('please add wallet name');
    return;
}
var default_settings = {
    "coin": "",
    "symbol": "",
    "cli": "path to cli",
    "daemon": "path to daemon",
    "example_txid": "txid for route examples",
    "example_hash": "hash for route examples",
    "dev_address": "address for route examples",
    "commands": {
        "startwallet": "-daemon",
        "stopwallet": "stop",
        "reindexWallet": "-daemon -txindex=1 -reindex=1",
        "rescanWallet": "-daemon -txindex=1 -rescan=1",
        "getblock": "getblock",
        "getblockhash": "getblockhash",
        "getallmasternodes": "listmasternodes",
        "getrawtransaction": "getrawtransaction",
        "getblockcount": "getblockcount",
        "getconnectioncount": "getconnectioncount",
        "getinfo": "getinfo",
        "getpeerinfo": "getpeerinfo",
        "getmasternodecount": "getmasternodecount",
        "getdifficulty": "getdifficulty",
        "getnetworkhashps": "getnetworkhashps",
        "getmininginfo": "getmininginfo"
    },
    "dbSettings": {
        "user": "masternodefixuser",
        "password": "b9wh42mB$jLfi(#nYVMc",
        "database": "",
        "address" : "localhost",
        "port" : 27017
    },
    "masternode_required": 0,
    "active": false,
    "hide": false
}

if(!settings[wallet]) {
    console.log('wallet', wallet)
    var current_settings = default_settings;
    current_settings.coin = wallet;
    current_settings.dbSettings.user = "masternode" + wallet + "user";
    current_settings.dbSettings.password = Array(20)
        .fill('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@#$^&*()_-+')
        .map(function(x) { return x[Math.floor(Math.random() * x.length)] })
        .join('');
    current_settings.dbSettings.database = wallet + 'db';
    var path = __dirname + "/../wallets/" + wallet + "/settings.json";
    fs.outputFile(path , JSON.stringify(current_settings, null, 4), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
    createDb(current_settings);
}

function createDb(settings) {
    const pipe = spawn('mongo', [settings.dbSettings.database, '--eval', "printjson(db.createUser(" +
    "            {" +
    "                user: '" + settings.dbSettings.user + "'," +
    "                pwd: '" + settings.dbSettings.password + "'," +
    "                roles:[{role:'root', db:'admin'}]," +
    "            }))"], {}, function done(err, stdout, stderr) {
        if (err) {
            console.error('Error:', err.stack);
            try {
                proc.kill('SIGINT');
                // fs.removeSync(__dirname + sess.dir);
                // delete sess.proc;
                // delete sess.dir;
            } catch(e) {
                console.log('e', e);
            }
            // throw err;
        }
        // console.log('Success', stdout);
        // console.log('Err', stderr);
    });
// const pipe = spawn('mongo', ['--eval', "printjson(db.getCollectionNames())"]);
    pipe.stdout.on('data', function (data) {
        console.log((data.toString('utf8').replace('undefined', '')));
    });

    pipe.stderr.on('data', (data) => {
        console.log('err', data.toString('utf8'));
    });

    pipe.on('close', (code) => {
        console.log('Process exited with code: '+ code);
    });
}


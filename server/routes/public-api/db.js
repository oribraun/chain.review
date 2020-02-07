const express = require('express');
var router = express.Router();

const db = require('./../../database/db');
const settings = require('./../../wallets/all_settings');
const wallet_commands = require('../../wallet_commands');

var TxController = require('./../../database/controllers/tx_controller');
var BlockController = require('./../../database/controllers/block_controller');
var TxVinVoutController = require('./../../database/controllers/tx_vin_vout_controller');
var AddressController = require('./../../database/controllers/address_controller');
var AddressToUpdateController = require('./../../database/controllers/address_to_update_controller');
var StatsController = require('./../../database/controllers/stats_controller');
var RichlistController = require('./../../database/controllers/richlist_controller');
var MasternodeController = require('./../../database/controllers/masternode_controller');
var PeersController = require('./../../database/controllers/peers_controller');

// var wallet = process.argv[2];

// router.get('/', (req, res) => {
//     res.json({item: res.locals.wallet + ' db api'});
// });
//
// router.get('/getAllBlocks/:limit', (req, res) => {
//     // if(!db.isConnected()) {
//     //     res.send('no database connected');
//     //     return;
//     // }
//     if(isNaN(parseInt(req.params['limit']))) {
//         res.send('limit value have to be number');
//         return;
//     }
//     TxController.getAll('blockindex', 'desc', parseInt(req.params['limit']), function(results) {
//         res.send(JSON.stringify(results, null, 2));
//     })
// });
router.get('/getdifficulty', (req, res) => {
    var wallet = res.locals.wallet;
    StatsController.getOne(wallet, function(stats) {
        if(stats) {
            res.send(stats.difficulty);
        } else {
            res.send(' no stats found yet');
        }
    });
});
router.get('/getconnectioncount', (req, res) => {
    var wallet = res.locals.wallet;
    StatsController.getOne(wallet, function(stats) {
        if(stats) {
            res.json(stats.connections);
        } else {
            res.send(' no stats found yet');
        }
    });
});
router.get('/getblockcount', (req, res) => {
    var wallet = res.locals.wallet;
    StatsController.getOne(wallet, function(stats) {
        if(stats) {
            res.json(stats.blockcount);
        } else {
            res.send(' no stats found yet');
        }
    });
});

router.get('/getblockhash/:number', (req, res) => {
    if(isNaN(parseInt(req.params['number']))) {
        res.send('limit value have to be number');
        return;
    }
    TxController.getOne(req.params['number'],function(result) {
        if(result) {
            res.send(JSON.stringify(result.blockhash, null, 2));
        } else {
            res.send('block not found');
        }
    })
});

router.get('/getblock/:hash', (req, res) => {
    wallet_commands.getBlock(res.locals.wallet, req.params['hash']).then(function(results) {
        // console.log('masternodes', masternodes);
        res.send(JSON.stringify(JSON.parse(results), null, 2));
    }).catch(function(err) {
        res.send(err);
    })
})

router.get('/getrawtransaction/:txid', (req, res) => {
    // wallet_commands.getRawTransaction(res.locals.wallet, req.params['txid']).then(function(tx) {
    //     res.send(JSON.stringify(tx, null, 2));
    // });
    TxController.getTxBlockByTxid(req.params['txid'],function(tx) {
        res.send(JSON.stringify(tx, null, 2));
    })
});

router.get('/getnetworkhashps', (req, res) => {
    wallet_commands.getNetworkHashps(res.locals.wallet).then(function(tx) {
        res.send(JSON.stringify(tx, null, 2));
    });
});

router.get('/getmoneysupply', (req, res) => {
    var wallet = res.locals.wallet;
    StatsController.getOne(wallet, function(stats) {
        if(stats) {
            res.json(stats.moneysupply);
        } else {
            res.send(' no stats found yet');
        }
    });
});

router.get('/getdistribution', (req, res) => {
    StatsController.getOne(res.locals.wallet, function(stats) {
        if(stats) {
            RichlistController.getOne(settings[res.locals.wallet].coin, function(results) {
                results.received.sort(function(a,b) {
                    return b.received - a.received;
                })

                var received = [];
                for(var i in results.received) {
                    received.push({received: (results.received[i].received).toFixed(8), address: results.received[i].a_id})
                }

                results.balance.sort(function(a,b) {
                    return b.balance - a.balance;
                })

                var balance = [];
                for(var i in results.balance) {
                    balance.push({balance: (results.balance[i].balance).toFixed(8), address: results.balance[i].a_id})
                }
                var distribution = get_distribution({'received': received, 'balance': balance}, stats);
                res.send(JSON.stringify(distribution, null, 2));
            })
        } else {
            res.send('no stats found yet');
        }
    });
});

router.get('/getAddress/:address', (req, res) => {
    AddressToUpdateController.getOneJoin(req.params['address'], 100, 0, function(address) {
        if(address) {
            res.send(JSON.stringify(address, null, 2));
        } else {
            res.send('no address found');
        }
        // db.disconnect();
    })
})

module.exports = router;

var get_distribution = function(richlist, stats){
    var distribution = {
        supply: stats.supply,
        t_1_25: {percent: 0, total: 0 },
        t_26_50: {percent: 0, total: 0 },
        t_51_75: {percent: 0, total: 0 },
        t_76_100: {percent: 0, total: 0 },
        t_101plus: {percent: 0, total: 0 }
    };
    for(var i = 0; i < richlist.balance.length; i++) {
        var count = i + 1;
        var percentage = ((richlist.balance[i].balance / 100000000) / stats.supply) * 100;
        if (count <= 25) {
            distribution.t_1_25.percent = distribution.t_1_25.percent + percentage;
            distribution.t_1_25.total = distribution.t_1_25.total + (richlist.balance[i].balance / 100000000);
        }
        if (count <= 50 && count > 25) {
            distribution.t_26_50.percent = distribution.t_26_50.percent + percentage;
            distribution.t_26_50.total = distribution.t_26_50.total + (richlist.balance[i].balance / 100000000);
        }
        if (count <= 75 && count > 50) {
            distribution.t_51_75.percent = distribution.t_51_75.percent + percentage;
            distribution.t_51_75.total = distribution.t_51_75.total + (richlist.balance[i].balance / 100000000);
        }
        if (count <= 100 && count > 75) {
            distribution.t_76_100.percent = distribution.t_76_100.percent + percentage;
            distribution.t_76_100.total = distribution.t_76_100.total + (richlist.balance[i].balance / 100000000);
        }
    }
    distribution.t_101plus.percent = parseFloat(100 - distribution.t_76_100.percent - distribution.t_51_75.percent - distribution.t_26_50.percent - distribution.t_1_25.percent).toFixed(2);
    distribution.t_101plus.total = parseFloat(distribution.supply - distribution.t_76_100.total - distribution.t_51_75.total - distribution.t_26_50.total - distribution.t_1_25.total).toFixed(8);
    distribution.t_1_25.percent = parseFloat(distribution.t_1_25.percent).toFixed(2);
    distribution.t_1_25.total = parseFloat(distribution.t_1_25.total).toFixed(8);
    distribution.t_26_50.percent = parseFloat(distribution.t_26_50.percent).toFixed(2);
    distribution.t_26_50.total = parseFloat(distribution.t_26_50.total).toFixed(8);
    distribution.t_51_75.percent = parseFloat(distribution.t_51_75.percent).toFixed(2);
    distribution.t_51_75.total = parseFloat(distribution.t_51_75.total).toFixed(8);
    distribution.t_76_100.percent = parseFloat(distribution.t_76_100.percent).toFixed(2);
    distribution.t_76_100.total = parseFloat(distribution.t_76_100.total).toFixed(8);
    return distribution;
}

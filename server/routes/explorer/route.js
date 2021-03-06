const express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs-extra');

const settings = require('./../../wallets/all_settings');

var TxController = require('./../../database/controllers/tx_controller');
var BlockController = require('./../../database/controllers/block_controller');
var TxVinVoutController = require('./../../database/controllers/tx_vin_vout_controller');
var AddressController = require('./../../database/controllers/address_controller');
var AddressToUpdateController = require('./../../database/controllers/address_to_update_controller');
var StatsController = require('./../../database/controllers/stats_controller');
var RichlistController = require('./../../database/controllers/richlist_controller');
var MasternodeController = require('./../../database/controllers/masternode_controller');
var PeersController = require('./../../database/controllers/peers_controller');
var MarketsController = require('./../../database/controllers/markets_controller');

router.get('/*', (req, res) => {
    // console.log('req.url', req.url)
    // console.log(__dirname + "/../../../explorer/dist/index.html");
    // console.log(path.resolve(__dirname + "/../../../explorer/dist/index.html"));
    // BlockController.getAll2({}, {blockindex: true, blockhash: true, txid: true},'blockindex', 'desc', 10, 0, function(results) {
    StatsController.getOne(res.locals.wallet, function(stats) {
        BlockController.getAll('blockindex', 'desc', 1 ,function(block) {
            var total = 0;
            if(block && block.length) {
                total = block[0].blockindex;
            }
            MarketsController.getAll('symbol', 'desc', 0, function(markets) {
                var data = {
                    wallet: res.locals.wallet,
                    symbol: settings[res.locals.wallet].symbol,
                    devAddress: settings[res.locals.wallet].dev_address,
                    blockHash: settings[res.locals.wallet].example_hash,
                    txHash: settings[res.locals.wallet].example_txid,
                    stats: stats,
                    total: total,
                    markets: markets.map(function(obj) { return {symbol: obj.symbol, summary: obj.summary}})
                };
                // console.log(data);
                var pth = __dirname + "/../../../chain.review.clients/explorer/dist/index.html";
                let html = path.resolve(pth);
                var htmlData = fs.readFileSync(html, {encoding: 'utf-8'});
                htmlData = htmlData.replace('<base href="">', '<base href="/explorer/' + res.locals.wallet + '">');
                var output_path = pth.replace('index.html', 'compiled_index.html');
                fs.writeFileSync(output_path, htmlData);
                // console.log(htmlData);
                // console.log(output_path);
                // let base = "explorer/" + res.locals.wallet;
                // let replacement = `</title><base href="${base}">`;
                // fs.createReadStream(html).pipe(replacestream('</title>', replacement))
                res.render(path.resolve(output_path), {
                    data: JSON.stringify(data),
                });
            });
        })
        // });
    })
});

// router.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname + "/../../../explorer/dist/index.html"));
// });

// router.get('/richlist', (req, res) => {
//     RichlistController.getOne(settings[res.locals.wallet].coin, function(results) {
//         RichlistController.getOne(settings[res.locals.wallet].coin, function(results) {
//             res.send(JSON.stringify({balance: results.balance, received: results.received}, null, 2));
//         })
//     })
// });

module.exports = router;

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var db = require('./../db');
 
var MasternodeSchema = new Schema({
  rank: {type: Number, default: 0},
  network: { type: String },
  txhash: { type: String },
  outidx: {type: Number, default: 0},
  pubkey: { type: String },
  collateral: {type: Number, default: 0},
  status: { type: String },
  addr: { type: String },
  version: {type: Number, default: 0},
  lastseen: {type: Number, default: 0},
  activetime: {type: Number, default: 0},
  lastpaid: {type: Number, default: 0}
}, {id: false, timestamps: true});
// console.log('db.getCurrentConnection()', db.getCurrentConnection())
var connections = db.getConnections();
var obj = {};
for(var i in connections) {
  obj[i] = connections[i].model('Masternode', MasternodeSchema);
}
module.exports = obj;

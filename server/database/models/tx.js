var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
var db = require('./../db');

var TxSchema = new Schema({
  txid: { type: String, lowercase: true, unique: true, index: true},
  vin: { type: Array, default: [] },
  vout: { type: Array, default: [] },
  timestamp: { type: Number, default: 0 },
  blockhash: { type: String, index: true },
  blockindex: {type: Number, default: 0, index: true},
}, {id: false, timestamps: true});
var connections = db.getConnections();
var obj = {};
for(var i in connections) {
  obj[i] = connections[i].model('Tx', TxSchema);
}
module.exports = obj;

const fs = require('fs');
const helpers = require('../helpers');
const spawn = require('child_process').spawn;

const TEN_MEGABYTES = 1000 * 1000 * 10;
const options = {};
const execFileOpts = { encoding: 'utf8' ,maxBuffer: TEN_MEGABYTES };

var wallet = process.argv[2];
if(!wallet) {
    console.log('no wallet found');
    return;
}
var startTime = new Date();
function startReindex() {
    var proc = spawn('/usr/bin/node', ['--max-old-space-size=8192', '/var/www/html/chain.review/server/sync.js', wallet, 'update_tx'], {execFileOpts, options}, function done(err, stdout, stderr) {
        if (err) {
            console.error('Error:', err.stack);
            // reject(err.stack);
            try {
                proc.kill('SIGINT');
                // fs.removeSync(__dirname + sess.dir);
                // delete sess.proc;
                // delete sess.dir;
            } catch (e) {
                // console.log('e', e);
            }
            // throw err;
        }
        // console.log('Success', stdout);
        // console.log('Err', stderr);
    });
    process.stdin.pipe(proc.stdin);
    proc.stdout.setEncoding('utf8');
// sess.proc = proc;
// sess.dir = dir;
// console.log("sess.proc.pid before", sess.proc.pid)

    proc.stderr.on('data', function (data) {
        console.log('err', data.toString('utf8'));
        // reject(data.toString('utf8'));
        // process.stderr.write(data);
    });
    proc.stdout.on('data', function (data) {
        // var data = JSON.parse(data);
        // console.log('data', data.replace('\n', ''));
        var array = data.split('\n');
        for(var i = 0; i < array.length - 1; i++) {
            console.log('data', array[i]);
        }
        array = null;
        // results += data;
        // process.stdout.write(data);
    });
    proc.on('close', function (code, signal) {
        // resolve(results);
        console.log('code', code);
        console.log('signal', signal);
        console.log('spawn closed');
        if(!code) {
            startUpdateVinVout()
        } else {
            process.exit(1);
        }
    });
    proc.on('exit', function (code) {
        // console.log('spawn exited with code ' + code);
        proc.stdin.end();
        proc.stdout.destroy();
        proc.stderr.destroy();
    });
}
function startUpdateVinVout() {
    var proc = spawn('/usr/bin/node', ['--max-old-space-size=8192', '/var/www/html/chain.review/server/sync.js', wallet, 'update_tx_vin_vout_and_addresses_cursor'], {execFileOpts, options}, function done(err, stdout, stderr) {
        if (err) {
            console.error('Error:', err.stack);
            // reject(err.stack);
            try {
                proc.kill('SIGINT');
                // fs.removeSync(__dirname + sess.dir);
                // delete sess.proc;
                // delete sess.dir;
            } catch (e) {
                // console.log('e', e);
            }
            // throw err;
        }
        // console.log('Success', stdout);
        // console.log('Err', stderr);
    });
    process.stdin.pipe(proc.stdin);
    proc.stdout.setEncoding('utf8');
// sess.proc = proc;
// sess.dir = dir;
// console.log("sess.proc.pid before", sess.proc.pid)

    proc.stderr.on('data', function (data) {
        console.log('err', data.toString('utf8'));
        // reject(data.toString('utf8'));
        // process.stderr.write(data);
    });
    proc.stdout.on('data', function (data) {
        // var data = JSON.parse(data);
        // console.log('data', data.replace('\n', ''));
        var array = data.split('\n');
        for(var i = 0; i < array.length - 1; i++) {
            console.log('data', array[i]);
        }
        array = null;
        // results += data;
        // process.stdout.write(data);
    });
    proc.on('close', function (code, signal) {
        // resolve(results);
        console.log('code', code);
        console.log('signal', signal);
        console.log('spawn closed');
        console.log(helpers.getFinishTime(startTime));
        if(!code) {
            // process.exit();
            startUpdateAddresses();
        } else {
            process.exit(1);
        }
    });
    proc.on('exit', function (code) {
        // console.log('spawn exited with code ' + code);
        proc.stdin.end();
        proc.stdout.destroy();
        proc.stderr.destroy();
    });
}
function startUpdateAddresses() {
    var proc = spawn('/usr/bin/node', ['/var/www/html/chain.review/server/sync.js', wallet, 'update_addresses_order_and_sum'], {execFileOpts, options}, function done(err, stdout, stderr) {
        if (err) {
            console.error('Error:', err.stack);
            // reject(err.stack);
            try {
                proc.kill('SIGINT');
                // fs.removeSync(__dirname + sess.dir);
                // delete sess.proc;
                // delete sess.dir;
            } catch (e) {
                // console.log('e', e);
            }
            // throw err;
        }
        // console.log('Success', stdout);
        // console.log('Err', stderr);
    });
    process.stdin.pipe(proc.stdin);
    proc.stdout.setEncoding('utf8');
// sess.proc = proc;
// sess.dir = dir;
// console.log("sess.proc.pid before", sess.proc.pid)

    proc.stderr.on('data', function (data) {
        console.log('err', data.toString('utf8'));
        // reject(data.toString('utf8'));
        // process.stderr.write(data);
    });
    proc.stdout.on('data', function (data) {
        // var data = JSON.parse(data);
        console.log('data', data.replace('\n', ''));
        // results += data;
        // process.stdout.write(data);
    });
    proc.on('close', function (code, signal) {
        // resolve(results);
        console.log('code', code);
        console.log('signal', signal);
        console.log('spawn closed');
        console.log(helpers.getFinishTime(startTime));
        process.exit();
    });
    proc.on('exit', function (code) {
        // console.log('spawn exited with code ' + code);
        proc.stdin.end();
        proc.stdout.destroy();
        proc.stderr.destroy();
    });
}
startReindex();

// took 27:9:29.976


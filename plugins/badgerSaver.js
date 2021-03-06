var _ = require('lodash');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var debug = require('debug')('plugin:badgerSaver');
var moment = require('moment');
var nconf = require('nconf');
var path = require('path');

var various = require('../lib/various');
var mongo = require('../lib/mongo');
var urlutils= require('../lib/urlutils');

function badgerFingerprint(memo, unclean, inclusionName) {

    var entry = {
        inclusion: inclusionName
    };

    _.each(unclean.counts, function(amount, jsfunction) {
        if(amount) {
            var k = _.replace(jsfunction, /\./g, '_');
            /* in mongo you can't save key with '.' */
            entry[k] = amount;
        }
    });

    memo.push(entry);
    return memo;
};

/* this function acquire the .json saved by badger-claw and create
 * a meaningful set of mongodb object, in the 'badger' table */
function saveBadger(gold, conf) {

    if(_.isUndefined(gold.badger)) {
        debug("badger has triggered an error, skipping");
        return false;
    }

    var sourcefile = path.join(gold.disk.incompath, 'badger-output.json');
    var needInfo = [ 'subjectId', 'href', 'needName' ];
    var core = _.pick(gold, needInfo);

    core.promiseId = gold.id;
    core.version = 1;
    core.VP = conf.VP;
    core.when = new Date();

    debug("%s: Looking for json output in %s", core.promiseId, sourcefile);

    return fs
        .readFileAsync(sourcefile, 'utf8')
        .then(JSON.parse)
        .then(function(content) {
            var cc = _.reduce(content.fingerprint, badgerFingerprint, []);

            return _.map(cc, function(value) {
                return _.extend(value, core);
            });
        })
        .then(function(data) {
            debug("+ Saving %d keys/value in .badger (%s promiseId)",
                _.size(data), data[0].promiseId);

            return mongo
                .writeMany(nconf.get('schema').badger, data);
        });
};

module.exports = function(val, conf) {

    /* fully indepotent, return always $val to be confirmed */
    return saveBadger(val, conf)
        .catch(function(error) {
            debug("!! %s", error);
	    debug("TIMEOUT=60 OUT_FILE=badgertmp/%s/%s/badger-output.json EXTENSION_PATH=badger-claw/privacy-badger-symlink.crx badger-claw/crawler.py %s", val.id, moment().format("YYYY-MM-DD"), val.href);
            val.saveError = true;
        })
        .return(val);
}

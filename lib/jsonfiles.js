var _ = require('lodash'),
    Promise = require('bluebird'),
    fs = require('fs'),
    debug = require('debug')('lib.jsonfiles'),
    moment = require('moment');

Promise.promisifyAll(fs);

/*
var theTarget = function(urlObject) {
    return _.find(urlObject._ls_links, function(u) {
        return u.type == "target";
    });
};

var theNotTarget = function(urlObject) {
    return _.filter(urlObject._ls_links, function(u) {
        return u.type != "target";
    });
};
*/

var jsonReader = function(sourceFile) {

    return fs
        .readFileAsync(sourceFile, "utf-8")
        .then(function(strcontent) {
            return JSON.parse(strcontent);
        })
        .catch(function(error) {
            console.error(error);
            console.log(sourceFile);
            return {}
        })
        .tap(function(content) {
            if (!_.endsWith(sourceFile, '.log')) {
                debug("jsonReader %s: %d entries", sourceFile, _.size(content) );
            }
        });
};


var usedLocation = function()
{
    /* still to be used as library */
    var whenWant = moment();
    if(process.env.FROMLIST_DETAILS) {
      return process.env.FROMLIST_DETAILS;
      debug("Imported option --json.detail %s", whenWant);
    } else if(process.env.FROMLIST_DAY !== "0") {
      whenWant = moment(whenWant-(process.env.FROMLIST_DAY*24*3600000)).format('YYMMDD');
      debug("Imported option --json.day %s", whenWant);
      return whenWant;
    }
    return whenWant.format('YYMMDD');

}

var fileStruct = function(location, fname) {
    return {
        dom: location + fname + '.html',
        timeout: location +  fname +".timeout",
        render: location +  fname +'.jpeg',
        io: location +  fname +'.json',
        text: location +  fname +'.txt',
        headers: location +  fname +'.head'
    };
};

var directoryStruct = function(links, diskPath) {
    /* why isn't working the targetHref in this way ?
    _.find(links, function(u) { return u.type == "target"; }), */
    diskPath = (_.endsWith(diskPath, "/")) ? diskPath : diskPath + "/";

    /* Remind: this is used in urlops, usedLocation above is a mix between JSON and URLOPS vars */
    var timeString = usedLocation(), // moment().format('YYMMDD'),
        targetHref = links[0],
        shortHash = _.trunc(targetHref._ls_id_hash, { length: 6, omission: '' }),
        host = targetHref.host,
        location = diskPath + timeString + "/" + host + "/" + shortHash + "/";

    return {
        timeString: timeString,
        location: location
    };
};

module.exports = {
    jsonReader: jsonReader,
    directoryStruct: directoryStruct,
    fileStruct: fileStruct
};
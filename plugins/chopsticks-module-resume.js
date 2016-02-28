
var _ = require('lodash'),
    Promise = require('bluebird'),
    debug = require('debug')('plugin.resume'),
    fileStruct = require('../lib/jsonfiles').fileStruct,
    checkPresence = require('../lib/importer').checkPresence;

module.exports = function(datainput) {
    /* ignore the disk content, take the list from input and keep only the content
        properly acquired. This module is equivalent to (fromList + fetcher) */

    return new Promise.map(datainput.source, function(siteEntry) {

        return checkPresence(siteEntry.logFile)
            .then(function(logFileExists) {
                siteEntry.is_present = logFileExists;
                return checkPresence(
                    fileStruct(siteEntry._ls_dir.location,
                               siteEntry._ls_dir.timeString ).io
                ).then(function(phantomFileExists) {
                    if(phantomFileExists !== siteEntry.is_present) {
                        debug("Ambiguous condition in %s, logF %s, IO %s",
                            siteEntry._ls_dir.location,
                            siteEntry.is_present,
                            phantomFileExists
                        );
                    }
                    siteEntry.is_present &= phantomFileExists;
                })
                .return(siteEntry);
            });
    })
    .then(function(newSource) {
        datainput.source = newSource;
        return datainput;
    });
};

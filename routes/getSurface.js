
var _ = require('lodash');
var Promise = require('bluebird');
var debug = require('debug')('route:getSurface');
var moment = require('moment');
var nconf = require('nconf');
 
var surfaceOps = require('../lib/campaignOps');

/* This API return a surface table of the last day scan results, picking from tasks
 * absolved in the last 36 hours, and returning them for DataTable format */
function getSurface(req) {

    var filter = { task: req.param('task') };
    var consideredHours = 36

    return surfaceOps.pickLastHours(filter, consideredHours)
        .then(surfaceOps.tableReduction)
        .then(function(reduced) {
            return {
                'json': reduced
            }
        });
};

module.exports = getSurface;
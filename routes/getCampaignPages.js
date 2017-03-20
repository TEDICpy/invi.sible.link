var _ = require('lodash');
var debug = require('debug')('route:getCampaignPages');
var pug = require('pug');
var nconf = require('nconf').env();

var campaignName = nconf.get('campaign');

var pugCompiler = function(filePrefix) {
    return pug.compileFile(
        __dirname + '/../campaigns/' + campaignName + '/' + filePrefix + '.pug', {
            pretty: true,
            debug: false
        }
    );
};

/* The page map is fixed, and there are only three, but the 
 * location does depend on the campaign name */

var pageMap = {
    'home': pugCompiler('pugs/pagestruct'),
    'landing': pugCompiler('pugs/landing'),
    'what-to-do': pugCompiler('pugs/what-to-do'),
    'about': pugCompiler('pugs/about'),
    'archive': pugCompiler('pugs/archive'),
    'site': pugCompiler('pugs/site')
};

var getCampaignPages = function(req) {

    var pageName = _.get(req.params, 'page');
    debug("page name %s", pageName);
    debugger;

    if(_.isUndefined(_.get(pageMap, pageName))) {
        debug("%s getCampaignPages on %s: not found", req.randomUnicode, pageName);
        pageName = '404';
    } else {
        debug("%s getCampaignPages of %s", req.randomUnicode, pageName);
    }

    return { 'text': pageMap[pageName]() };
};

module.exports = getCampaignPages;

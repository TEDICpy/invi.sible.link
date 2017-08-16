
function renderStats(jsonData, containerId, VPs, keywords) {

    var fields = _.flatten(_.map(VPs, function(vpname) {
        return _.map(keywords, function(kw) {
            return vpname + kw;
        });
    }));

    var displayName = _.flatten(_.map(VPs, function(vpname) {
        return _.map(keywords, function(kw) {
            return vpname + ' ' + kw;
        });
    }));

    console.log(fields);
    console.log(displayName);
    console.log(jsonData);

    return c3.generate({
        bindto: containerId,
        data: {
            json: jsonData,
            keys: {
                x: 'date',
                value: fields
            },
            xFormat: '%Y-%m-%d %H:%M',
            type: 'spline',
            names: _.zipObject(fields, displayName)
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%d %H:%M'
                },
            }
        }
    });
};

function lastHours(config) {

    var fieldSet = {
        'loadavg': [ 'load-0', 'load-1'], //, 'load-2' ],
        'memory': [ 'free' ], // , 'total' ],
        'mongo': [ 'saved' ] // , 'accesses' ]
    };
    var VPs = [ 'HK', 'WS', 'AMS' ];
    var url = '/api/v1/stats/' + config.hours;

    console.log("Fetching last", config.hours, "from", url);

    d3.json(url, function(content) {

        console.log(content);

        if(config.memory)
            var memoryChart = renderStats(content.memory, config.memory, VPs, fieldSet.memory);

        if(config.loadavg)
            var loadavgChart = renderStats(content.loadavg, config.loadavg, VPs, fieldSet.loadavg);

        if(config.mongo)
            var mongoChart = renderStats(content.mongo, config.mongo, VPs, fieldSet.mongo);
    });

}

/* small library function used to generate stats for every campaign */
var campaignList = [{
    title: "Chupadados research, 4 country so far",
    match: "clinics-",
    idn: "clinicsBlock"
},{
    title: "All the others",
    match: "",
    idn: "remainingBlock"
}];

function filterStats(data, campMatch) {
    var filtered = _.filter(data, function(o) {
        return _.startsWith(o.campaign, campMatch);
    });
    // _.reject(data, _.startWith(campMatch, campaign));
    console.log(filtered);
    var nd = _.reduce(filtered, function(memo, e) {

        var o = { date: e.date };
        var keyname = e.campaign + '-' + e.kind;

        if(e.kind === 'promises')
            return memo;

        memo.kn.push(keyname);

        if(e.kind === 'evidences') {
            _.set(memo.ax, keyname, 'y2');
            _.set(memo.ty, keyname, 'line');
        }
        else {
            _.set(memo.ax, keyname, 'y');
            _.set(memo.ty, keyname, 'bar');
        }

        _.set(o, keyname, e.amount);
        memo.v.push(o);

        return memo;
    }, { kn: [], v: [], ax: {}, ty: {} });
    console.log(nd);

    nd.v = _.reduce(_.groupBy(nd.v, 'date'), function(memo, s, d) {
        console.log(d);
        var x = { date: d };
        _.each(s, function(o) {
            var co = _.omit(o, [ 'date' ]);
            _.set(x, _.first(_.keys(co)), _.first(_.values(co)) );
        });
        memo.push(x);
        return memo;
    }, []);
    console.log(nd);
    return nd;
};
function c3Append(destId, nd) {
    console.log("c3append");
    return c3.generate({
        bindto: destId,
        data: {
            json: nd.v,
            keys: {
                x: 'date',
                value: _.uniq(nd.kn)
            },
            types: nd.ty,
            axes: nd.ax
        },
        legend: { show: false },
        axis: {
            x: {
                type: 'timeseries',
                xFormat: "day %d"
            },
            y2: {
                show: true,
            }
        }
    });
}
/* end */

function tasksInsertion(containerId) {

    var url = '/api/v1/subjects';

    /* this API return the daily stats for campaign and for collection */

    console.log("tasksInsertion in ", containerId);
    d3.json(url, function(data) {

        _.each(campaignList, function(C) {
            d3.select(containerId).append('div').attr('id', C.idn);
            var cleanData = filterStats(data, C.match);
            c3Append('#' + C.idn, cleanData);
        });

    });
};

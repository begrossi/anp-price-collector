var Confidence = require('confidence');

var criteria = {
    env: process.env.NODE_ENV
};

var config = {
    $meta: 'This file configures the collector.',
    endpoint: {
        $filter: 'env',
        test: 'http://localhost:9090/admin/anpdata',
        $default: 'http://localhost:8080/admin/anpdata'
    }
};


var store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};

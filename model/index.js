var mongoose   = require('mongoose');
var winston = require('winston');
var uri = require('../config.json').db.url;

mongoose.connect(uri, function(err){
    if(!err) {
        winston.info('mongo uri: '+uri.replace(/:[^@:]+@/,':xxx@'));
    } else {
        winston.error(err);
    }
}); // connect to our database

//'test' == env &&
mongoose.set('debug', true);

exports.mongoose=mongoose;

['state','station','collectedData'].forEach(function(key){
    var nkey = key[0].toUpperCase()+key.substr(1);
    exports[nkey] = require('./'+key);
})

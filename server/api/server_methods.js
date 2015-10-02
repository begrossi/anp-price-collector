var models = require('../model');
var _ =require('underscore');
var Q =require('q');

exports.register = function(server, options, next){

    return next();

};

exports.register.attributes = {
    name: 'server-methods'
};

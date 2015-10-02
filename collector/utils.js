var cheerio = require('cheerio')
var $=require('cheerio');
var Q=require('q');
var request = Q.nbind(require('request'));
var _=require('underscore');
var iconv = require('iconv-lite');
var moment = require('moment');
var winston = require('winston');

exports.randomIntInc= function (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
};

exports.get=function(url, doNotParse, _i) {
    return request({
        method: 'GET',
        url: url,
        encoding: null,
        timeout: 200000,
        gzip: true
    }).spread(function(response, body){
        if (response.statusCode != 200) {
            return Q.reject(response);
        }
        body = iconv.decode(body, 'iso-8859-1');
        if(doNotParse)
            return body;

        return cheerio.load(body,{ignoreWhitespace: true, xmlMode: false});
    }).catch(function(err){
        if(err && err.code=='ECONNRESET' && !(_i || _i<10)) {
            winston.warn('[utils.get] trying to recover from ECONNRESET for url '+url);
            return Q.delay(5000).then(function(){
                return exports.get(url, doNotParse, (_i||0)+1);
            });
        }
        return Q.reject(err);
    });
};

['POST','PUT'].forEach(function(method){
    var fname = method.toLowerCase();
    exports[fname]=function(url, form, useJSON, doNotParse, _i) {
        return request({
            method: method,
            url: url,
            form: !useJSON?form:undefined,
            json: useJSON?form:undefined,
            encoding: null,
            timeout: 200000,
            gzip: true
        }).spread(function(response, body){
            if (response.statusCode != 200) {
                return Q.reject(response.statusCode);
            }
            body = iconv.decode(body, 'iso-8859-1');
            if(doNotParse)
                return body;

            return cheerio.load(body,{ignoreWhitespace: true, xmlMode: false});
        }).catch(function(err){
            if(err && err.code=='ECONNRESET' && !(_i || _i<10)) {
                winston.warn('[utils.'+fname+'] trying to recover from ECONNRESET for url '+url +', form='+JSON.stringify(form));
                return Q.delay(5000).then(function(){
                    return exports.post(url, doNotParse, (_i||0)+1);
                });
            }
            return Q.reject(err);
        });
    };
});

exports.getSelectOptions=function($html, selector) {
    return $html(selector+' option').map(function(i, option){
        var $option=$html(option);
        return {
            value: $option.attr('value'),
            text: $option.text()
        };
    }).get();
};

exports.convertArray2Object=function(arr, prop1, prop2) {
    return _.chain(arr).map(function(item){return [item[prop1],item[prop2]]}).object().value()
};

exports.getInt=function(text) {
    try {
        return parseInt(text);
    } catch(e) {
        //return undefined
    }
}
exports.getFloatBR=function(text) {
    try {
        var f = parseFloat(text.replace(',','.'))
        return (f || f==0) ? f : undefined;
    } catch(e) {
        //return undefined
    }
}
exports.getDateBR=function(text) {
    try {
        return moment(text+' -0300', "DD/MM/YYYY Z").toDate();
    } catch(e){
        //return undefined
    }
};
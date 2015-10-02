var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statisticsSchema = new Schema({
    "_codType": {type:String, required:true, index:true},
    "type": {type:String, required:true, index:true},
    "_numStations": Number,
    "consumerPrice": {
        "averagePrice": Number,
        "standardDeviation": Number,
        "minPrice": Number,
        "maxPrice": Number,
        "averageMargin": Number
    },
    "distributionPrice": {
        "averagePrice": Number,
        "standardDeviation": Number,
        "minPrice": Number,
        "maxPrice": Number
    }
});

var stationSchema = new Schema({
    "name": {type:String, required:true, index:true},
    "address": {type:String},
    "area": {type:String},
    "flag": {type:String, required:true, index:true},
    "prices": [new Schema({
        "_codType": {type:String, required:true, index:true},
        "type": {type:String, required:true, index:true},
        "sellPrice": Number,
        "buyPrice": Number,
        "saleMode": String,
        "provider": String,
        "date": Date
    })]
});

var citySchema = new Schema({
    _id:  {type:String, required:true, index:true},
    name: {type:String, required:true, index:true},
    statistics: [statisticsSchema],
    stations: [stationSchema]
});

var anpdataSchema = new Schema({
    week: {type:String, required: true, index: true},
    state: {type:String, required: true, index: true},
    cities: [citySchema]
});

var anpdata = module.exports = mongoose.model('anpdata', anpdataSchema);

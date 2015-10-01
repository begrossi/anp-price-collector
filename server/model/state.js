var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var citySchema = new Schema({
    _id:  {type:String, required:true, index:true},
    name: {type:String, required:true, index:true},
}, { id: false});

var stateSchema = new Schema({
    _id:  {type:String, required:true, index:true},
    name: {type:String, required:true, index:true},
    cities: [citySchema]
}, { id: false});

var state = module.exports = mongoose.model('state', stateSchema);

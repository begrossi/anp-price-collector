var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stationSchema = new Schema({
    name: {type:String, required:true, index:true},
    address: {type:String, required:true},
    area: {type:String, required:true},
    flag: {type:String, required:true, index:true},

    state: {type: String, required: true, index:true},//references to state._id
    city: {type: String, required: true, index:true},//references to city._codCity
});

stationSchema.index({name: 1, address: 1, area: 1, flag: 1}, {unique: true});

var station = module.exports = mongoose.model('station', stationSchema);

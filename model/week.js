var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var weekSchema = new Schema({
    _id:  {type:String, required:true, index:true},
    desc: {type:String, required:true, index:true},
    from: {type:Date,   required:true, index:true},
    to:   {type:Date,   required:true, index:true},
}, { id: false});

var week = module.exports = mongoose.model('week', weekSchema);

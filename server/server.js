var Q = require('q');
var Composer = require('./composer');

Q.nfcall(Composer).then(function(server){
    server.start(function () {
        console.log('Started the api on port ' + server.info.port);
    });
}).catch(function(err){
    console.error('[server]',err&&err.stack||err);
}).done();

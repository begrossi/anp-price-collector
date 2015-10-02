var Hoek = require('hoek');


exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            reply({ message: 'Welcome' });
        }
    });


    next();
};


exports.register.attributes = {
    name: 'api'
};

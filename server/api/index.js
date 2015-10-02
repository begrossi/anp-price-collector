var Hoek = require('hoek');
var Joi = require('joi');


exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply({ message: 'Welcome' });
        }
    });

    server.route({
        method: 'PUT',
        path: '/admin/anpdata',
        config: {
            validate: {
                payload: {
                    week: Joi.object().required().keys({
                        _codSemana: Joi.string().required(),
                        from: Joi.date().required(),
                        to: Joi.date().required()
                    }),
                    _codEstado: Joi.string().required(),
                    name: Joi.string().required(),
                    cities: Joi.array().required().items({
                        _codCity: Joi.string().required(),
                        name: Joi.string().required(),
                        statistics: Joi.array().items({
                            _codType: Joi.string().required(),
                            type: Joi.string().required(),
                            _numStations: Joi.number().integer(),
                            consumerPrice: Joi.object().required().keys({
                                averagePrice: Joi.number().precision(3).allow([null,'-']),
                                standardDeviation: Joi.number().precision(3).allow([null,'-']),
                                minPrice: Joi.number().precision(3).allow([null,'-']),
                                maxPrice: Joi.number().precision(3).allow([null,'-']),
                                averageMargin: Joi.number().precision(3).allow([null,'-']),
                            }),
                            distributionPrice: Joi.object().keys({
                                averagePrice: Joi.number().precision(3).allow([null,'-']),
                                standardDeviation: Joi.number().precision(3).allow([null,'-']),
                                minPrice: Joi.number().precision(3).allow([null,'-']),
                                maxPrice: Joi.number().precision(3).allow([null,'-']),
                            })
                        }),
                        stations: Joi.array().items({
                            name: Joi.string().required(),
                            address: Joi.string().required(),
                            area: Joi.string().required(),
                            flag: Joi.string().required(),
                            prices: Joi.array().items({
                                _codType: Joi.string().required(),
                                type: Joi.string().required(),
                                sellPrice: Joi.number().precision(3).allow([null,'-']),
                                buyPrice: Joi.number().precision(3).allow([null,'-']),
                                saleMode: Joi.string().allow([null,'-']),
                                provider: Joi.string().allow([null,'-']),
                                date: Joi.date().required()
                            })
                        })
                    })
                }
            }
        },
        handler: function (request, reply) {
            console.log(request.payload);


            reply({ result: 'success' });
        }
    });

    next();
};


exports.register.attributes = {
    name: 'api'
};

var Hoek = require('hoek');
var Joi = require('joi');
var Q = require('q');
var logger = require('winston');
var Boom = require('boom');


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
                    state: Joi.object().required().keys({
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
                    })
                }
            }
        },
        handler: function (request, reply) {
            Q.nfcall(function(){
                return Q.ninvoke(server.methods,'addWeeklyStateData', request.payload.week, request.payload.state);
            }).then(function(anpdata){
                reply(anpdata);
            }).catch(function(err){
                logger.error(err, (err && err.stack));
                reply(Boom.badRequest());
            }).done();
        }
    });

    next();
};


exports.register.attributes = {
    name: 'api'
};

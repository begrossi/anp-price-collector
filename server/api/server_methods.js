var models = require('../model');
var _ =require('underscore');
var Q =require('q');
var logger = require('winston');

exports.register = function(server, options, next){
    server.method([
        {   name: "getOrCreateDocument",
            options: {
                /*cache: {
                    expiresIn: 5*60000//5min
                }*/
            },
            method: function(model, doc, id, next) {
                Q.fcall(function() {
                    return Q.ninvoke(model, 'findOne', {_id: id});
                }).then(function(_doc){
                    return _doc || Q.ninvoke(new model(_.extend({_id: id}, doc)), 'save');
                }).then(function(doc){
                    next(doc);
                }).catch(function(err) {
                    if(err && err.code==11000)//duplicate, busca denovo!
                        return Q.ninvoke(model, 'findOne', {_id: id}).then(function(doc){
                            next(null, doc);
                        }).catch(function(err){
                            next(err);
                        }).done();

                    next(err);
                }).done();
            }
        },
        {   name: "addWeeklyStateData",
            options: {
                /*cache: {
                    expiresIn: 60000//1min
                }*/
            },
            method: function(week, state, next) {
                Q.fcall(function() {
                    //para ser mais eficiente, aqui vamos chamar esse método assincronamente, nao nos interessa o resultado dele para os demais passos.
                    Q.ninvoke(server.methods, 'getOrCreateDocument', models.Week, week, week._codSemana).catch(function(err){
                        logger.error('[addWeeklyStateData] can\'t create week: ',JSON.stringify(week), err);
                    });
                    //idem
                    Q.ninvoke(server.methods, 'getOrCreateDocument', models.State, state, state._codEstado).catch(function(err){
                        logger.error('[addWeeklyStateData] can\'t create state: ',JSON.stringify(state), err);
                    });

                    _.chain(state.cities).map(function(city){
                        return _.map(city.stations, function(station){
                            return _.extend(_.pick(station, 'name','address','area','flag'), {
                                state: state._codEstado,
                                city: city._codCity
                            });
                        });
                    }).flatten().each(function(station){
                        //tambem assincrono.
                        Q.ninvoke(new models.Station(station), 'save').then(function(station){
                            logger.info('[addWeeklyStateData] station created: ', JSON.stringify(station));
                        }).catch(function(err){
                            if(!err || err.code!=11000)
                                logger.error('[addWeeklyStateData] can\'t create station: ',JSON.stringify(station), err);
                        }).done();
                    });

                    return Q.ninvoke(new models.Anpdata({
                        week: week._codSemana,
                        state: state._codEstado,
                        cities: state.cities
                    }), 'save');
                }).then(function(anpdata){
                    next(null, anpdata);
                }).catch(function(err){
                    next(err);
                }).done();
            }
        }
    ]);

    return next();

};

exports.register.attributes = {
    name: 'server-methods'
};

var Q=require('q');
var _=require('underscore');
var utils=require('./utils');
var winston = require('winston');
var config = require('./config');
var endpoint = config.get('/endpoint');

Q.nfcall(function(){
    return getInitialData().then(function(data) {
        //winston.info('data=', data);
        var descSemana = data.inputValues.desc_Semana;
        var week = {
            _codSemana: data.inputValues.cod_Semana,
            from: utils.getDateBR(descSemana.replace('de ','').replace(/a .*$/,'')),
            to: utils.getDateBR(descSemana.replace(/^de\s.*a\s/,''))
        };

        return processStates(week, data).then(function (states) {
            return {
                week: week,
                states: states
            };
        }).then(function (res) {
            //var fs = require('fs');
            //return Q.ninvoke(fs, 'writeFile', 'apndata_'+res.week._codSemana+'.json', JSON.stringify(res, null, 2));
        });
    });
}).catch(function(err){
    console.error(err, err&&err.stack||err);
}).done();

function getInitialData() {
    return utils.get('http://www.anp.gov.br/preco/prc/Resumo_Por_Estado_Index.asp').then(function($html){

        var estados=utils.getSelectOptions($html, 'select[name="selEstado"]');

        var combustiveis=utils.getSelectOptions($html, 'select[name="selCombustivel"]');

        var inputValues=$html('form#frmAberto input[type="hidden"]').map(function(i,item) {
            var $input=$html(item);
            return {
                name: $input.attr('name'),
                value: $input.attr('value')
            }
        }).get();

        //var codigo=$html('#divQuadro').text().replace(/\s+/g,'');
        //inputValues.push({name: 'txtValor', value: codigo});

        return {
            inputValues: utils.convertArray2Object(inputValues,'name','value'),
            estados: estados,
            combustiveis: combustiveis
        };
    });
}

function processStates(week, data) {
    return Q.all(_.map(_.first(data.estados,1), function (estado) { //faz assincronamente cada estado!
        //espera um tempo aleatório para espaçar mais as requisições...
        return Q.delay(utils.randomIntInc(500, 2500)).then(function () {
            return getStateData(week, estado, data.combustiveis, data.inputValues);
        }).then(function (res) {
            winston.info(estado.text + ', ' + _.size(res.cities) + ' cidades, ' + _.reduce(res.cities, function (sum, city) {
                    return sum + _.size(city.stations)
                }, 0) + ' postos: ' + _.pluck(res.cities, 'name').join(', '));

            var data = {week:week, state: res};
            //winston.info(JSON.stringify(data,null,1));
            return utils.put(endpoint, data, true).then(function(){
                winston.info(estado.text+' enviado para o servidor.');

                return res;
            });
        });
    }));
}

function getStateData(week, estado, combustiveis, inputValues, i, _allData) {
    i = i || 0;
    _allData = _allData || [];
    if(i>=combustiveis.length) {
        var stateData = _consolidaStateData(_allData, inputValues.desc_Semana);
        return fullfillStations(week, stateData, combustiveis);
    }

    return getCityData(estado, combustiveis[i], inputValues).then(function(data) {
        _allData.push.apply(_allData, data);
        return getStateData(week, estado, combustiveis, inputValues, i+1, _allData);
    });
}
function _consolidaStateData(data) {
    var groupedByCity = _.groupBy(data, '_codCity');
    var first = _.first(data);
    var state = {_codEstado: first._codEstado, name: first.state};
    state.cities = _.map(groupedByCity, function(cityData, codCity) {
        var first = _.first(cityData);
        var city = _.pick(first, '_codCity','name');
        city.statistics = _.map(cityData, function(data){
            return _.extend({
                _codType: data._codType,
                type: data.type
            }, data.statistics);
        });
        return city;
    });
    return state;
}

function fullfillStations(week, stateData, combustiveis, _cityIndex, _typeIndex) {
    _cityIndex = _cityIndex || 0;
    _typeIndex = _typeIndex || 0;

    if(_typeIndex >= _.size(combustiveis)) {
        _typeIndex = 0;
        _cityIndex = _cityIndex + 1;
    }

    if(_cityIndex >= _.size(stateData.cities))
        return Q(stateData);

    var city = stateData.cities[_cityIndex];
    var combustivel = combustiveis[_typeIndex];
    return getStations(week._codSemana, combustivel.value.replace(/\*.*$/,''), combustivel.text, city._codCity).then(function(stations) {
        if(!city.stations)
            city.stations = [];

        _.each(stations, function(stationData) {
            var stationMainData = _.pick(stationData,'name','address','area','flag');
            var s = _.findWhere(city.stations, stationMainData);
            if(!s) {
                s = stationMainData;
                city.stations.push(s);
            }
            if(!s.prices)
                s.prices = [stationData.price];
            else
                s.prices.push(stationData.price);
        });

        return fullfillStations(week, stateData, combustiveis, _cityIndex, _typeIndex+1);
    });
}



function getCityData(estado, combustivel, inputValues) {
    var form = _.extend({
        selEstado: estado.value,
        selCombustivel: combustivel.value
    }, inputValues);
    return utils.post('http://www.anp.gov.br/preco/prc/Resumo_Por_Estado_Municipio.asp', form).then(function($html){
        var $lines = $html('table.table_padrao  a.linkpadrao').parent();
        //winston.info('$lines.length=',$lines.length);
        return $lines.map(function(i, el) {
            var $lincol = $html(el);
            var $a = $lincol.children('a');
            var cityData = {
                _codEstado: estado.value,
                state: estado.text,
                _codSemana: inputValues.cod_Semana,
                _codType: combustivel.value.replace(/\*.*$/,''),
                type: combustivel.text,
                _codCity: $a.attr('href').replace("javascript:Direciona('",'').replace("');",''),
                name: $a.text(),
                statistics: {}
            };

            $lincol=$lincol.next();
            cityData.statistics._numStations=utils.getInt($lincol.text());

            _.each([
                ['consumerPrice',['averagePrice','standardDeviation','minPrice','maxPrice','averageMargin']],
                ['distributionPrice', ['averagePrice','standardDeviation','minPrice','maxPrice']]
            ], function(section) {
                var sectionName=section[0],
                    sectionValues=section[1];
                cityData.statistics[sectionName] = _.object(_.map(sectionValues, function(val){
                    $lincol=$lincol.next();
                    return [val, utils.getFloatBR($lincol.text())];
                }));
            });

            return cityData;
        }).get();
    });
}

function getStations(codSemana, codType, type, codCity) {
    var form = {
        cod_semana: codSemana,
        cod_combustivel: codType,
        selMunicipio: codCity
    };
    return utils.post('http://www.anp.gov.br/preco/prc/Resumo_Semanal_Posto.asp', form).then(function($html) {
        var $line=$html('#postos_nota_fiscal table.table_padrao tr:nth-child(2)');
        var stations = [];
        while($line.text()) {
            //winston.info($line.text());
            var station={};
            var $col = $line.children().first();
            _.each(['name','address','area','flag'], function(colname){
                station[colname]=$col.text();
                $col=$col.next();
            });
            station.price={
                _codType: codType,
                type: type,
            };
            _.each(['sellPrice','buyPrice'], function(colname){
                station.price[colname]=utils.getFloatBR($col.text());
                $col=$col.next();
            });
            _.each(['saleMode','provider'], function(colname){
                $col.text()!='-' && (station.price[colname]=$col.text());
                $col=$col.next();
            });
            station.price.date = utils.getDateBR($col.text());

            stations.push(station);
            $line=$line.next();
        }

        return stations;
    });
}

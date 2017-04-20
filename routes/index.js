var express = require('express');
var router = express.Router();
var locationModelClass = require('../models/geo.model.js');

function init_router(db) {
    /* GET home page. */
    var locationModel = new locationModelClass(db);

    router.get('/', function(req, res, next) {
        res.render('index', {});
    });

    router.post('/locations', function(req, res, next) {
        locationModel.getNearLocations(parseFloat(req.body.latt), parseFloat(req.body.long), function(err, locations) {
            if (err) {
                console.log(err);
                res.status(400).json({ "error": "Error al obtener localidades" });
            } else {
                res.status(200).json(locations);
            }
        });
    });

    router.get('/locations', function(req, res, next) {
        locationModel.getLocations(function(err, locations) {
            if (err) {
                console.log(err);
                res.status(400).json({ "error": "Error al obtener localidades" });
            } else {
                res.status(200).json(locations);
            }
        });
    })

    router.post('/add', function(req, res, next) {
        locationModel.addLocation(parseFloat(req.body.lat), parseFloat(req.body.long), function(err, location) {
            if (err) {
                console.log(err);
                res.status(400).json({ "error": "Error al guardar localidad" });
            } else {
                res.status(200).json(location);
            }
        });
    });

    router.get('/setup', function(req, res, next) {
        locationModel.setup();
        res.status(200).json({ "status": "ok" });

    });

    return router;
}
module.exports = init_router;
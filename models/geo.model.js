var getModel = function(db) {
    this.db = db;
    console.log(db);
    this.locationColl = db.collection('locationDocs');
};


getModel.prototype.setup = function() {
    var _db = this.db;
    _db.collection('locationDocs', { "strict": true }, function(err, col) {
        if (err) {
            _db.createCollection('locationDocs', {}, function(err, col) {
                if (!err) {
                    col.createIndex({ "geodata": "2dsphere" }, function(err, result) {
                        if (err) console.log(err);
                        console.log(result);
                    }); //createIndex
                } else {
                    console.log(err);
                }
            }); // createCollection
        } else {
            col.indexExists('geodata_2dsphere', function(err, exists) {
                if (!exists) {
                    col.createIndex({ "geodata": "2dsphere" }, function(err, result) {
                        if (err) console.log(err);
                        console.log(result);
                    }); //CreateIndex
                }
            }); //indexExists
        }
    }); // collection
}

getModel.prototype.addLocation = function(lat, long, handler) {
        let doc = {
            time: Date.now(),
            geodata: {
                "type": "Point",
                "coordinates": [long, lat]
            }
        };
        this.locationColl.insertOne(doc, {}, function(err, rslt) {
            if (err) {
                handler(err, null);
            } else {
                handler(null, rslt.ops);
            }
        });
    } //addLocation

getModel.prototype.getNearLocations = function(lat, long, handler) {
    var query = {
        "geodata": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [long, lat]
                },
                "$maxDistance": 5000 // 5km
            }
        }
    }

    this.locationColl.find(query).toArray(function(err, locations) {
        if (err) {
            handler(err, null);
        } else {
            handler(null, locations);
        }
    });
}

getModel.prototype.getLocations = function(handler) {
    var query = {}

    this.locationColl.find(query)
        .sort({ "time": -1 })
        .limit(10)
        .toArray(function(err, locations) {
            if (err) {
                handler(err, null);
            } else {
                handler(null, locations);
            }
        });
}


module.exports = getModel;